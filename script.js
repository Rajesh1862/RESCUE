let map;

function initMap() {
    const findMechanicBtn = document.getElementById('find-mechanic-btn');

    findMechanicBtn.addEventListener('click', () => {
        if (navigator.geolocation) {
            findMechanicBtn.innerText = 'Finding Mechanics...';
            findMechanicBtn.disabled = true;

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const userPos = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    displayMap(userPos);
                    findMechanicBtn.style.display = 'none'; // Hide button after map loads
                },
                (error) => {
                    alert('Could not get your location. Please check your browser settings.');
                    findMechanicBtn.innerText = 'Find a Mechanic Near Me';
                    findMechanicBtn.disabled = false;
                    console.error('Geolocation Error:', error);
                }
            );
        } else {
            alert('Your browser does not support geolocation.');
        }
    });
}

function displayMap(location) {
    map = new google.maps.Map(document.getElementById('map'), {
        center: location,
        zoom: 14,
    });

    // Marker for user's current location
    new google.maps.Marker({
        position: location,
        map: map,
        title: "You are here",
    });

    // Use the PlacesService to find nearby bike repair shops
    const service = new google.maps.places.PlacesService(map);
    const request = {
        location: location,
        radius: '5000', // Search within 5 kilometers
        type: ['motorcycle_repair', 'bicycle_store']
    };

    service.nearbySearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            if (results.length > 0) {
                results.forEach(place => {
                    createMarkerForPlace(place);
                });
            } else {
                alert('No nearby mechanics found within 5km.');
            }
        } else {
            console.error('Places search failed:', status);
        }
    });
}

function createMarkerForPlace(place) {
    const marker = new google.maps.Marker({
        map: map,
        position: place.geometry.location,
        title: place.name
    });

    const infoWindow = new google.maps.InfoWindow({
        content: `
            <h3>${place.name}</h3>
            <p>${place.vicinity}</p>
            ${place.opening_hours ? `<p>Status: ${place.opening_hours.open_now ? 'Open Now' : 'Closed'}</p>` : ''}
            <a href="https://www.google.com/maps/dir/?api=1&destination=${place.geometry.location.lat()},${place.geometry.location.lng()}" target="_blank">Get Directions</a>
        `
    });

    marker.addListener('click', () => {
        infoWindow.open(map, marker);
    });
}