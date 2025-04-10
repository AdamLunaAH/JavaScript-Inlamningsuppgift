"use strict";

// Import the service class
import musicService from "../database-script/music-group-services.js";

//Initialize the service
const _service = new musicService(
    `https://seido-webservice-307d89e1f16a.azurewebsites.net/api`
);

// Default values
let data = [];
let currentPageNr = 0;
let searchInput = "";
let listDivNr = 1;

// Checks if the search input is null or whitespace and returns true or false
function isNullOrWhiteSpace(str) {
    return str == null || str.trim().length === 0;
}

// Gets the music groups data from the service
async function getMusicGroupsData() {
    // Gets the music groups data from the service depending on the search input
    if (isNullOrWhiteSpace(searchInput)) {
        // If the search input is null or whitespace, get all music groups
        data = await _service.readMusicGroupsAsync(currentPageNr, true);
    } else {
        // If the search input is not null or whitespace, get the music groups that match the search input
        /*
            Note: When searching it checks all group data to find a match, that means that if you search for "J" it will find groups that have "J" in any of the fields, not just the name.
            For example if you search for "J" it will find groups that does not a "J" in the name but are within the Jazz genre.
            I noticed this  quite late in the project and I did not have time to fix it, without breaking list paging and search function.
            */
        data = await _service.readMusicGroupsAsync(
            currentPageNr,
            true,
            searchInput
        );
    }
}

// async functions
(async () => {
    // Gets the main div element
    const _list = document.querySelector("#list-of-items");

    // Gets the page, search, and clear buttons and adds event listeners
    const btnPrev = document.querySelector("#prevBtn");
    const btnNext = document.querySelector("#nextBtn");

    btnPrev.addEventListener("click", clickHandlerPrev);
    btnNext.addEventListener("click", clickHandlerNext);

    const btnClear = document.querySelector("#clear-btn");
    btnClear.addEventListener("click", clickHandlerClear);

    const searchBtn = document.querySelector("#search-btn");
    searchBtn.addEventListener("click", clickHandlerSearch);

    // Search with Enter key event
    const searchInputBox = document.querySelector("#search-input");
    searchInputBox.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            event.preventDefault();
            searchInput = searchInputBox.value;
            clearSearch();
            showGroups();
            musicGroupCount();
        }
    });

    // Used to clear and reset
    function clickHandlerAll(e) {
        clearSearch();
        showGroups();
    }

    // Clear the search and reset the list
    function clickHandlerClear(e) {
        searchInput = "";
        document.querySelector("#search-input").value = "";
        clearSearch();
        showGroups();
        musicGroupCount();
    }

    // Clears the list and shows the music groups that match the search input
    function clickHandlerSearch(e) {
        searchInput = document.querySelector("#search-input").value;
        clearSearch();
        showGroups();
        musicGroupCount();
    }

    // Paging
    function clickHandlerNext(e) {
        if (data?.pageCount && currentPageNr < data.pageCount - 1) {
            currentPageNr++;
        }
        clickHandlerAll();
    }

    function clickHandlerPrev(e) {
        if (data?.pageCount && currentPageNr > 0) {
            currentPageNr--;
        }
        clickHandlerAll();
    }

    // Check if the current page is the first or last page and disable the buttons
    function pageButtonCheck() {
        if (currentPageNr === 0 && data.pageCount === 1) {
            document.querySelector("#prevBtn").disabled = true;
            document.querySelector("#nextBtn").disabled = true;
        } else if (currentPageNr === 0) {
            document.querySelector("#prevBtn").disabled = true;
        } else if (currentPageNr === data.pageCount - 1) {
            document.querySelector("#nextBtn").disabled = true;
        } else {
            document.querySelector("#prevBtn").disabled = false;
            document.querySelector("#nextBtn").disabled = false;
        }
    }

    // Update the music group count
    function musicGroupCount() {
        const groupCount = document.querySelector("#music-group-count");
        groupCount.innerText = `${data.dbItemsCount} music groups found`;
    }

    // Show the music groups in the list (data changes on search input)
    async function showGroups() {
        // Get the music groups data from the service
        await getMusicGroupsData();

        // Checks if its the first or last page
        pageButtonCheck();

        // Updates the music group count
        musicGroupCount();

        // Default div number
        // Used to changes the background color of the list item div
        listDivNr = 1;

        // Creates the list of music groups
        for (const item of data.pageItems) {
            const div = document.createElement("div");

            // If the listDivNr is even, add theme-even, else add theme-odd

            const themeClass = listDivNr % 2 === 0 ? "theme-even" : "theme-odd";
            div.classList.add(
                "col-md-12",
                themeClass,
                "d-flex",
                "justify-content-evenly"
            );

            // Increments the listDivNr
            listDivNr++;

            // Creates the music group name and year elements
            const mgName = document.createElement("p");
            mgName.classList.add("music-group-name");
            mgName.innerText = item.name;
            div.appendChild(mgName);
            const mgYear = document.createElement("p");
            mgYear.classList.add("music-group-year");
            mgYear.innerText = item.establishedYear;
            div.appendChild(mgYear);

            // Creates the music group group-info page link
            // Adds a link id to the web address
            const link = document.createElement("a");
            link.href = `groupinfo.html?id=${item.musicGroupId}`;
            link.innerText = "Go to group info";
            link.classList.add("btn", "btn-primary", "btn-sm", "btn-block");
            link.setAttribute("role", "button");
            link.setAttribute("aria-pressed", "true");

            div.appendChild(link);

            _list.appendChild(div);
        }
    }

    // Clears the search results
    function clearSearch() {
        while (_list.firstChild) {
            _list.removeChild(_list.firstChild);
        }
    }

    // Show the music groups on load
    await showGroups();
})();
