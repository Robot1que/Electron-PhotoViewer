
document.title = "loading ...";

window.addEventListener("load", () => {
    window.setTimeout(
        () => {
            require("./App");
            document.title = "loaded";
        }, 
        10000
    );
});
