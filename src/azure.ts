import axios, {AxiosError} from "axios";

const makeMagic = () => {
    const targets = findTargets();

    targets.forEach(target => {
        enchantTarget(target);
    });
};

const logSomething = (message: String) => {
    console.log("(oii) " + message);
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

        if (file === undefined || line === undefined) {
            // todo: add some animation to the button, e.g. shaking, flashing red
            logSomething("Oops. Something went wrong while parsing the filename and line. ╭∩╮(⋟﹏⋞)╭∩╮")
            return;
        }

        logSomething("Abracadabra, sim sala bim, to the file he desires I will take him. ✲´*。.❄¨¯`*✲。❄。*。¨¯`*✲");
        logSomething("Trying to open " + file + " at line " + line + " in IntelliJ IDEA.");

        openFile(file, line);
    });

    div.className = "open-in-intellij";
    div.append(span);

    parent.append(div);

    logSomething("Enchanted! ᕙ(⇀‸↼‶)ᕗ")
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
            logSomething("IntelliJ responded with " + response.statusText + ".");
        },
        reason => {
            // TODO: show error message
            if ((reason as AxiosError).code == "ERR_NETWORK") {
                logSomething("Oops. Something went wrong while opening the file. ╭∩╮(⋟﹏⋞)╭∩╮");
                logSomething("Please make sure you have opened IntelliJ IDEA.");
            } else {
                logSomething("Oops. An unexpected error occurs: " + reason);
            }
        }
    );
}

logSomething("Do you want some magic? Yes, of course you do. ٩(^‿^)۶")

const observer = new MutationObserver(() => {
    makeMagic();
});

Array.from(document
    .getElementsByClassName("activity-feed-list"))
    .map(element => (element as HTMLElement))
    .forEach(feedList => observer.observe(feedList, {
        attributes: true,
        childList: true,
        subtree: true
    }));
