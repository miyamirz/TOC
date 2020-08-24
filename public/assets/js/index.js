// Your JS code goes here
function handleBodyLoad() {
    fetch("/api/book/maths")
        .then((res) => res.json())
        .then(({ response, statusCode, status }) => {
            if (statusCode === 200) {
                constructOuterList(response);
            } else {
                handleBookLoadError(response, status);
            }
        })
        .catch((err) =>
            handleBookLoadError({
                message: "Something terrible happened",
                status: "Error",
            })
        );
}

const handleBookLoadError = ({ message }, status) => {
    let errorContainer = document.createElement("div");
    errorContainer.setAttribute("class", "error-container");

    errorContainer.innerHTML = `<div class="error-img"><img src='/assets/images/error.png' alt=""/></div>
                                  <div class="error-text">${status} : ${message}</div>
                                  `;

    let tocContainer = document.getElementById("toc-container");
    tocContainer.appendChild(errorContainer);
};

const constructOuterList = (data) => {
    const addChapterOrLesson = ({
      title,
        type,
        completeCount,
        childrenCount,
        id,
    }) => {
        let item = document.createElement("div");
        item.classList.add("content-item", "addBorder");
        item.setAttribute("data-id", id);
        item.setAttribute("data-expanded", "false");
        let lessonsContainer = null;
        let expandIconEle = document.createElement("div");
        expandIconEle.setAttribute(
            "class",
            `${type === "chapter" ? "expandIcon" : "expandIcon expandIconDisabled"}`
        );
        expandIconEle.innerHTML = "+";
        item.appendChild(expandIconEle);
        if (type === "chapter") {
            item.addEventListener("click", handleChapterClick);
            //add lessons container
            lessonsContainer = document.createElement("div");
            lessonsContainer.setAttribute("id", `lessons_${id}`);
            lessonsContainer.setAttribute("class", "lessons_hidden");
        }
        let titleEle = document.createElement("div");
        titleEle.setAttribute("class", "item-title");
        titleEle.innerHTML = title;
        item.appendChild(titleEle);
        //progress bar
        let progressBar = document.createElement("div");
        progressBar.setAttribute("class", "progress-bar");
        let progressWidth = childrenCount
            ? Math.floor((completeCount / childrenCount) * 100)
            : 0;
        progressBar.innerHTML = `<div class="progress-bar-width" style='height:100%;width:${progressWidth}%'>
                                   </div>
                                   <div class="progress-text">${progressWidth}% complete</div>`;
        item.appendChild(progressBar);

        let tocContainer = document.getElementById("toc-container");
        tocContainer.appendChild(item);
        lessonsContainer ? tocContainer.appendChild(lessonsContainer) : null;
    };
    const showCustomErrorPopup = ({ message }, status) => {
        let textEle = (document.getElementsByClassName(
            "error-text"
        )[0].innerHTML = `${status} : ${message}`);
        document.getElementsByClassName(
            "custom-error-message"
        )[0].style.visibility = "visible";
        setTimeout(() => {
            document.getElementsByClassName(
                "custom-error-message"
            )[0].style.visibility = "hidden";
        }, 1500);
    };

    const handleChapterClick = (e) => {
        let { id: chapterId, expanded } = e.currentTarget.dataset;
        if (expanded === "false") {
            let targetParentElement = e.currentTarget;
            let lessonsContainer = document.getElementById(`lessons_${chapterId}`);
            lessonsContainer.innerHTML = `<div class="loading_container"><span class="loading_image"><img src="/assets/images/loading.png" alt="" /></span>
                                              <span class="loading_text">Loading...</span></div>
                                          `;
            lessonsContainer.setAttribute("class", "lessons_visible");
            fetch(`/api/book/maths/section/${chapterId}`)
                .then((res) => res.json())
                .then(({ response, statusCode, status }) => {
                    if (statusCode === 200) {
                        createLessons(response[chapterId], targetParentElement, chapterId);
                    } else {
                        lessonsContainer.innerHTML = "";
                        lessonsContainer.setAttribute("class", "lessons_hidden");
                        showCustomErrorPopup(response, status);
                    }
                });
        } else {
            let lessonsContainer = document.getElementById(`lessons_${chapterId}`);
            lessonsContainer.setAttribute("class", "lessons_hidden");
            e.currentTarget.getElementsByClassName("expandIcon")[0].innerHTML = "+";
            e.currentTarget.setAttribute("data-expanded", "false");
        }
    };
    let outerListData = [...data.sort((a, b) => a.sequenceNO - b.sequenceNO)];
    outerListData.forEach((item) => {
        addChapterOrLesson({ ...item });
    });
};

const createLessons = (lessonsData, targetParentElement, containerId) => {
    const addLesson = ({ title, status, id }, parentContainerId) => {
        let item = document.createElement("div");
        item.setAttribute("class", "lesson-item addBorder");

        let progressEle = document.createElement("div");
        progressEle.setAttribute("title", status);
        progressEle.classList.add("progressEle", `${status.toLowerCase()}`);

        let titleEle = document.createElement("div");
        titleEle.setAttribute("class", "item-title");
        titleEle.innerHTML = title;

        item.appendChild(progressEle);
        item.appendChild(titleEle);
        let lessonsContainer = document.getElementById(parentContainerId);
        lessonsContainer.appendChild(item);
        lessonsContainer.setAttribute("class", "lessons_visible");
        targetParentElement.getElementsByClassName("expandIcon")[0].innerHTML = "-";
        targetParentElement.setAttribute("data-expanded", "true");
    };
    let sortedLessonsData = [
        ...lessonsData.sort((a, b) => a.sequenceNO - b.sequenceNO),
    ];
    document.getElementById(`lessons_${containerId}`).innerHTML = "";
    sortedLessonsData.forEach((lesson) => {
        addLesson({ ...lesson }, `lessons_${containerId}`);
    });
};
