import axios, {AxiosError} from "axios";

let intro = true;

const createOii = () => {
    const ul = document.createElement("ul");
    const img = document.createElement("img");
    const div = document.createElement("div");

    ul.id = "oii-conversation"

    img.id = "oii-wizard";
    img.src = chrome.runtime.getURL("oii.png");

    div.id = "oii-wizard-wrapper";
    div.append(ul);
    div.append(img);

    document.body.append(div);
};

const letOiiTalk = (message: String, delay?: number, condition?: Function) => {
    setTimeout(() => {
        if (!condition || condition()) {
            const li = document.createElement("li");

            li.className = "oii";
            li.innerText = message.toString();

            setTimeout(() => {
                li.parentNode?.removeChild(li);
            }, 10000);

            document.getElementById("oii-conversation")?.append(li);
        }
    }, delay ?? 0);
}

const letYouTalk = (message: String, delay?: number, condition?: Function) => {
    setTimeout(() => {
        if (!condition || condition()) {
            const li = document.createElement("li");

            li.className = "you";
            li.innerText = message.toString();

            setTimeout(() => {
                li.parentNode?.removeChild(li);
            }, 10000);

            document.getElementById("oii-conversation")?.append(li);
        }
    }, delay ?? 0);
}

const makeMagic = () => {
    const targets = findTargets();

    targets.forEach(target => {
        enchantTarget(target);
    });
};

const findTargets = (): HTMLElement[] => {
    return Array.from(document
        .getElementsByClassName("comment-file-header"))
        .map(element => (element as HTMLElement))
        .filter(element => element.getElementsByClassName("open-in-intellij").length == 0);
};

const enchantTarget = (parent: HTMLElement) => {
    const div = document.createElement("div");
    const span = document.createElement("span");

    span.innerText = "Open in IntelliJ IDEA";
    span.addEventListener("click", () => {
        const file = getFile(parent);
        const line = getLine(parent);

        letYouTalk("Oii, please open this file for me.");

        if(intro) {
            letOiiTalk("Someone is impatient. Well...", 500)
            intro = false;
        }

        if (file === undefined || line === undefined) {
            letOiiTalk("Oops. My senses seem to be a bit clouded at the moment. I cannot recognize the file information.", 500)
            return;
        }

        letOiiTalk("Abracadabra, sim sala bim, to the file he desires I will take him.", 500);

        openFile(file, line);
    });

    div.className = "open-in-intellij";
    div.append(span);

    parent.append(div);
};

const getFile = (parent: HTMLElement): String | undefined => {
    return parent
            .getElementsByClassName("comment-file-header-link")
            .item(0)
            ?.nextSibling
            ?.textContent
            ?.substr(1)
        ?? undefined;
};

const getLine = (parent: HTMLElement): String | undefined => {
    return parent
            .getElementsByClassName("diff-comment")
            .item(0)
            ?.parentElement
            ?.previousElementSibling
            ?.getElementsByClassName("repos-line-number")
            .item(0)
            ?.getAttribute("data-line")
        ?? undefined;
};

const openFile = (file: String, line: String) => {
    axios.create().get(
        "http://localhost:63342/api/file",
        {
            params: {
                file: file,
                line: line
            }
        }
    ).then(
        response => {
            if (response.status !== 200) {
                letOiiTalk("Oops. Something went wrong. IntelliJ responded with status " + response.statusText + " (" + response.status + ").", 1000);
            }
        },
        reason => {
            if ((reason as AxiosError).code == "ERR_NETWORK") {
                letOiiTalk("My power seems not to be strong enough. You have to help me a little bit. Please make sure you have opened IntelliJ IDEA.", 1000);
            } else {
                letOiiTalk("Obscure forces seem to interfere with my magic. You can find the reason in the log.", 1000);
                console.log("Obscure force: " + reason);
            }
        }
    );
}
createOii();

letOiiTalk("Do you want some magic?", 2000, (): boolean => intro);
letYouTalk("Yes, of course I do.", 4000, (): boolean => intro);
letOiiTalk("So, tell me what I can do for you.", 6000, (): boolean => intro);

setTimeout(() => {
    intro = false;
}, 6000);

const observer = new MutationObserver(() => {
    makeMagic();
});

Array.from(document
    .getElementsByClassName("page-content"))
    .map(element => (element as HTMLElement))
    .forEach(feedList => observer.observe(feedList, {
        attributes: true,
        childList: true,
        subtree: true
    }));
