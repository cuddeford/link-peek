// @ts-check
console.log('link peek')

const getLink = node => {
    if (!node) {
        return false
    }

    if (node?.tagName?.toLowerCase?.() === 'a') {
        return node
    }

    const parent = node.parentNode

    if (!parent) {
        return false
    }

    if (parent?.tagName?.toLowerCase?.() === 'a') {
        return parent
    } else {
        return getLink(parent)
    }
}

const closeIframe = () => {
    const parent = document.querySelector('#link-peek-parent')
    if (parent) {
        parent.classList.remove('show')
        parent.querySelector('iframe').removeAttribute('src')
        parent.querySelector('iframe').removeAttribute('srcdoc')
    }
}

document.addEventListener('click', event => {
    closeIframe()
})

document.addEventListener('keydown', event => {
    if (event.code !== 'Escape') {
        return
    }

    closeIframe()
})

let mouseover
document.addEventListener('mouseover', async event => {
    if (!event.target) {
        return
    }

    const link = getLink(event.target)
    if (!link) {
        return
    }

    mouseover = link

    if (holdingShift) {
        await openIframe(link)
    } else {
        closeIframe()
    }
})

document.addEventListener('mouseout', event => {
    mouseover = undefined
})

let holdingShift = false
document.addEventListener('keydown', async event => {
    if (event.key === 'Shift' && !holdingShift) {
        holdingShift = true

        if (mouseover) {
            await openIframe(mouseover)
        }
    }
})

document.addEventListener('keyup', event => {
    if (event.key === 'Shift') {
        holdingShift = false
        closeIframe()
    }
})

const openIframe = async link => {
    console.log(`Preview tab: ${link.href}`)

    const parent = document.querySelector('#link-peek-parent')
    const iframe = parent.querySelector('iframe')

    if (parent) {
        // parent.querySelector('iframe').src = link.href
        parent.classList.remove('show')

        try {
            const req = await fetch(link.href, {
                method: 'GET',
                headers: {
                    'origin': 'https://www.google.com',
                    'x-requested-with': 'XMLHttpRequest',
                }
            })

            if (req.ok) {
                const body = await req.text()

                if (body.trim().startsWith('<')) {
                    iframe.removeAttribute('src')
                    iframe.srcdoc = body
                } else {
                    console.log('doesnt start with < so direct', body)
                    iframe.src = link.href
                    iframe.removeAttribute('srcdoc')
                }
            } else {
                console.log('bad fetch so direct', req.status, req.statusText)
                iframe.src = link.href
                iframe.removeAttribute('srcdoc')
            }
        } catch (e) {
            console.log('couldnt fetch so direct', e.message)
            iframe.src = link.href
            iframe.removeAttribute('srcdoc')
        }
    }
}

document.addEventListener('auxclick', async event => {
    const { target } = event

    if (event.which !== 2) {
        return
    }

    event.preventDefault()

    await openIframe(target)
})

const styleTag = document.createElement('style')
styleTag.innerHTML = `
    #link-peek-parent {
        z-index: 9999999;
        position: fixed;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        margin: auto;
        width: 500px;
        height: 700px;
        pointer-events: none;
        opacity: 0;
        transition: opacity 300ms ease-in-out;
    }

    #link-peek-parent.show {
        opacity: 1;
        pointer-events: all;
    }

    #link-peek {
        width: 100%;
        height: 100%;

        border: 0.5px solid #00000026;
        box-shadow: 0px 0px 20px 3px #00000026;
        border-radius: 12px;

        background: transparent;
    }
`

document.body.appendChild(styleTag)

const parentTag = document.createElement('div')
parentTag.id = 'link-peek-parent'

const iframeTag = document.createElement('iframe')
iframeTag.id = 'link-peek'

parentTag.appendChild(iframeTag)
document.body.appendChild(parentTag)

iframeTag.onload = () => {
    parentTag.classList.remove('show')
    parentTag.classList.add('show')
}
