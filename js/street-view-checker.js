let latLongPairs = [];
let progress = document.createElement('div')
progress.classList.add('progress')

async function initMap() {

    let promises = []

    var streetViewCheck = new google.maps.StreetViewService()

    for (let i = 0; i < latLongPairs.length; i++){

        let latlngLiteral2 = {lat: latLongPairs[i].lat, lng: latLongPairs[i].lng}

        try {
            
            promises.push(
                streetViewCheck.getPanoramaByLocation(latlngLiteral2, 50, processSVResponse)
                )

                function processSVResponse(data, status) { 
                    try { 
                        latLongPairs[i].imageDate = data.imageDate
                        latLongPairs[i].address = data.location.description
                    } catch (error) {
                        latLongPairs[i].imageDate = 'null';
                        latLongPairs[i].address = ',,';
                    }
                }
        } catch (error){
            continue;
        }
    }

    let main = document.querySelector('main')
    main.appendChild(progress)
    progress.textContent = "Fetching dates..."

    Promise.allSettled(promises)
        .catch(error => {console.log(error)})

        .then(saveFile);
}


const myForm = document.getElementById("myForm");
const csvFile = document.getElementById("csvFile");

myForm.addEventListener("submit", readFile)

function readFile (e) {
    e.preventDefault();
    const input = csvFile.files[0];
    const reader = new FileReader();

    reader.onload = function (e) {
    const text = e.target.result;

    fileToArray(text)

    };

    reader.readAsText(input);
}


function fileToArray(text) {
    const table = text.split('\n').slice(1)

    table.forEach(row => {
        let column = row.split(',')

        let newLiteral = {id:column[0], lat: Number(column[1]), lng: Number(column[2])}
        
        latLongPairs.push(newLiteral)
    });
    initMap()
}


function saveFile() {
    progress.textContent = "Saving..."
    let newString = convertLatLongPairs();

    const blob = new Blob([newString], {type: "octet-stream"});

    const href = URL.createObjectURL(blob);

    const a = Object.assign(document.createElement("a"), {href, style:"display:none", download:"coordinatesWithDates.csv"});
    document.body.appendChild(a)

    a.click();
    URL.revokeObjectURL(href);
    a.remove();
    progress.textContent = "Done!"
}


function convertLatLongPairs() {
    let newText = `sortField,latitude,longitude,imageDate,street,city,state\n`;

    latLongPairs.forEach(pair => {
        let addressArray = pair.address.split(',')
        
        if (addressArray.length < 3) {
            addressArray.unshift("")
        }

        newText = newText.concat(pair.id + "," + pair.lat + "," + pair.lng + "," + pair.imageDate + "," + addressArray[0] + "," + addressArray[1] + "," + addressArray[2] + "\n")
    })
    return newText;
}   