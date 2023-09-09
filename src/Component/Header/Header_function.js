import user_img from "../../Media/default_user_pic.png"
function open(target) {
    const target_div = document.querySelector(target)
    target_div.style.display = "flex";
    setTimeout(() => {
        target_div.style.height = "250px";
        target_div.style.opacity = "1"
    }, 10)
}
function close(target) {
    const target_div = document.querySelector(target)
    target_div.style.height = '0px';
    target_div.style.opacity = "0"
    setTimeout(() => {
        target_div.style.display = "none";
    }, 200)
}
function open_search(bollean_) {
    const target = document.querySelector("#searcharea")
    if (bollean_ === false) {
        target.style.display = "flex";
        console.log(window.innerWidth)
        setTimeout(() => {
            if (window.innerWidth <= 300) {
                target.style.width = "220px"
            }
            else {
                target.style.width = "300px";
            }
            target.style.opacity = "1"
        }, 10)
        return true
    }
    else if (bollean_ === true) {
        target.style.width = '0px';
        target.style.opacity = "0"
        setTimeout(() => {
            target.style.display = "none";
        }, 200)
        return false
    }
}

function account_set(data) {
    if (data.photo) {
        return (
            <>
                <img src={data.photo} id="Google_pic" alt="" />
            </>
        )
    }
    else if (!data.photo) {
        return (
            <>
                <img src={user_img} id="Google_pic" alt="" />
            </>
        )
    }
}
export { open_search, open, close, account_set }