var jekyllMaps = (function () {
    'use strict';
    var clusterSettings = {},
        clusterReady    = false,
        mapReady        = false,
        options         = {},
        data            = [],
        maps            = [];

    return {
        initializeMap:     initializeMap,
        initializeCluster: initializeCluster,
        register:          register
    };

    /**
     * Setup Google Maps options and call renderer.
     */
    function initializeMap() {
        options = {
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            center:    new google.maps.LatLng(0, 0),
            zoom:      12
        }
        mapReady = true;
        render();
    }

    /**
     * Register map data to be rendered once Google Maps API is loaded.
     *
     * @param String id
     * @param Array locations
     * @param Object settings
     */
    function register(id, locations, options) {
        data.push({id: id, locations: locations, options: options});
        render();
    }

    /**
     * Render maps data if Google Maps API is loaded.
     */
    function render() {
        if (!mapReady) return;

        while (data.length > 0) {
            var item       = data.pop(),
                bounds     = new google.maps.LatLngBounds(),
                mapOptions = Object.assign({}, options, item.options),
                map        = new google.maps.Map(document.getElementById(item.id), mapOptions),
                infoWindow = new google.maps.InfoWindow(),
                markers    = item.locations.map(function (location) {
                    return createMarker(location, mapOptions.showMarkerPopup);
                });

            map.fitBounds(bounds);
            google.maps.event.addListenerOnce(map, 'bounds_changed', onBoundsChanged);
            if (mapOptions.useCluster) {
                maps.push({map: map, markers: markers});
                processCluster();
            }
        }

        function createMarker(location, showMarkerPopup) {
            var position = new google.maps.LatLng(location.latitude, location.longitude),
                marker   = new google.maps.Marker({
                    position: position,
                    title:    location.title,
                    image:    location.image,
                    url:      location.url,
                    map:      map
                });

            bounds.extend(position);
            if (showMarkerPopup) marker.addListener('click', markerPopup);

            return marker;
        }

        function markerPopup() {
            var contentString = '<div class="map-info-window"><h5>' + this.title + '</h5>',
                link          = 'View';
            if (this.image.length > 0) {
                link = '<img src="' + this.image + '" alt="' + this.title + '"/>';
            }
            contentString += '<a href="' + this.url + '">' + link + '</a></div>';
            infoWindow.setContent(contentString);
            infoWindow.open(map, this);
        }

        function onBoundsChanged() {
            if (this.getZoom() > options.zoom) {
                this.setZoom(options.zoom);
            }
        }
    }

    function initializeCluster(settings) {
        clusterReady = true;
        clusterSettings = settings || {};
        processCluster();
    }

    function processCluster() {
        if (!clusterReady) return;

        while (maps.length > 0) {
            var obj = maps.pop();
            new MarkerClusterer(obj.map, obj.markers, {
                gridSize:  clusterSettings.grid_size || 25,
                imagePath: 'https://cdn.rawgit.com/googlemaps/js-marker-clusterer/gh-pages/images/m'
            });
        }
    }

    if (typeof Object.assign != 'function') {
        Object.assign = function (target) {
            'use strict';
            if (target == null) {
                throw new TypeError('Cannot convert undefined or null to object');
            }

            target = Object(target);
            for (var index = 1; index < arguments.length; index++) {
                var source = arguments[index];
                if (source != null) {
                    for (var key in source) {
                        if (Object.prototype.hasOwnProperty.call(source, key)) {
                            target[key] = source[key];
                        }
                    }
                }
            }
            return target;
        };
    }
}());