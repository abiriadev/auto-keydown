const app = {
    cht: null,
    async inject(callback, args = []) {
        let permissionDesc = { active: true, currentWindow: true }
        let [tab] = await chrome.tabs.query(permissionDesc)

        const { result } = (
            await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: callback,
                args,
            })
        ).find(frameResult => frameResult.frameId === 0)

        return result
    },
    clickListener({ cps, targetKey }) {
        return async ev =>
            (this.cht =
                (await this.inject(
                    ...(ev.currentTarget.checked
                        ? [
                              (cps, key) => {
                                  return setInterval(() => {
                                      document.dispatchEvent(
                                          new KeyboardEvent('keydown', {
                                              key,
                                          }),
                                      )
                                  }, 1000 / cps)
                              },
                              [cps.value, targetKey.value || 'a'],
                          ]
                        : [_ => clearInterval(_), [this.cht || 0]]),
                )) || this.cht)
    },
    start(ctx) {
        ctx.checkbox.addEventListener('change', this.clickListener(ctx))
    },
}

app.start({
    checkbox: document.getElementById('onoff'),
    cps: document.getElementById('cps'),
    targetKey: document.getElementById('targetKey'),
})
;(() =>
    document
        .getElementById('cps')
        .addEventListener(
            'input',
            ev =>
                (document.getElementById('per').innerText =
                    ev.currentTarget.value),
        ))()
