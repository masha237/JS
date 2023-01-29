let airports;
document.addEventListener("DOMContentLoaded", function(e){
    //console.log("document.onload");

    function onFetched(air) {
        let ans = [];
        for (let d of Object.values(air)) {
            if (d["iata"] && d["city"]) {
                ans.push({code: d["iata"], city: d["city"]});
            }


        }
        airports = ans;
    }
    fetch(`https://raw.githubusercontent.com/mwgg/Airports/master/airports.json`).then(function(response) {
        return response.json();}).then(onFetched);



});



let active = -1
let input = document.getElementById("input");
input.addEventListener("keyup", (e) => {

    if (e.keyCode === 40 || e.keyCode === 38) {
        return;
    }
    removeElements();
    active = -1;
    airports = airports.sort((a, b) => a.city.localeCompare(b.city));
    for (let i of airports) {
        if (i.city === null || i.code === null) {
            console.log("suka");
        }
        if ((i.city.toLowerCase().startsWith(input.value.toLowerCase()) ||
            i.code.toLowerCase().startsWith(input.value.toLowerCase())) && input.value !== "") {
            let listItem = document.createElement("li");
            listItem.classList.add("list-items");
            listItem.style.cursor = "pointer";
            listItem.tabIndex = 1;
            listItem.setAttribute("onclick", "display('" + i.city + " " + i.code + "')");
            let word = "";
            if (i.city.toLowerCase().startsWith(input.value.toLowerCase())) {
                word = "<b>" + i.city.substr(0, input.value.length) + "</b>";
                word += i.city.substr(input.value.length) + " " + i.code;
            } else {
                word = i.city + " <b>" + i.code.substr(0, input.value.length) + "</b>";
                word += i.code.substr(input.value.length) ;
            }
            listItem.innerHTML = word;
            document.querySelector(".list").appendChild(listItem);
        }
    }
});


document.addEventListener('keydown', function(e) {
    let items = document.querySelectorAll(".list-items")
    if(e.keyCode === 40) {
        if(active < items.length - 1) {
            active++
            items[active].focus()
        }
    } else if(e.keyCode === 38) {
        if(active > 0) {
            active--
            items[active].focus()
        }
    } else if (e.keyCode === 13 && active !== -1) {
        event.preventDefault();
        items[active].click()
    }
})

function display(value) {
    input.value = value;
    removeElements();
}
function removeElements() {
    let items = document.querySelectorAll(".list-items");
    items.forEach((item) => {
        item.remove();
    });
}