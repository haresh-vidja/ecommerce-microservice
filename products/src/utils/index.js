export const wait = (time) => {
    return new Promise((resolve) => {
        setTimeout(function () {
            resolve();
        }, time)
    })
}