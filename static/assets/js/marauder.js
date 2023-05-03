function logger(message) {
    textareaid = "log";
    document.getElementById(textareaid).innerHTML = document.getElementById(textareaid).innerHTML + "\n\rLOGGER:\n\r" + message;
}

function Marauder(name,lShoe,rShoe,scroll) {
    const LEFT = 0;
    const RIGHT = 1;
    const BOTH = 2;
    const STAND = 0;
    const WALK = 1;
    const RUN = 2;
    this.name = name;
    this.lastUpdate = null;
    this.lastPos = null;
    this.curPos = null;
    this.dir = 0;
    this.curFoot = BOTH;
    this.leftShoeIcon = lShoe;
    this.rightShoeIcon = rShoe;
    this.speed = 0;
    this.status = STAND;
    this.lastDistance = 0;
    this.scrollMarker = null;
    this.scroll = scroll

    this.fadeIn = function(map,marker,duration) {
        // Set the initial opacity of the marker to 0

        // Add the marker to the map after a delay of 2 seconds
        setTimeout(function() {
            marker.addTo(map);
            marker.getElement().style.opacity = 0;
            
            // Fade in the marker using a CSS transition
            marker.getElement().style.transition = 'opacity ' + 2000 + 'ms ease';
            marker.getElement().style.opacity = 1;
        }, duration);
        return marker;
    }

    this.fadeOut = function(map,marker) {
        // Set a timeout to fade out and remove the marker after the duration has passed
        setTimeout(function() {
            // Fade out the marker using a CSS transition
            marker.getElement().style.transition = 'opacity ' + 4000 + 'ms ease';
            marker.getElement().style.opacity = 0;

            // Remove the marker from the map after the animation has finished
            setTimeout(function() {
                map.removeLayer(marker);
            }, 2000);
        }, 5000);
    }

    this.updatePos = function(map,latLng) {
        let curTime = Date.now();
        if (this.lastPos == null) {
            this.lastPos = this.curPos = latLng;
            this.status = STAND;
            console.log("Update Pos: STAND");
            logger("Update Pos: STAND");
        } else {
            console.log(this.lastPos,latLng);
            let distance = this.lastPos.distanceTo(latLng);
            if (distance<=1.5) {
                console.log(distance);
                logger(distance);
                console.log("Probably standing still");
                logger("Probably standing still");
                this.speed = 0;
                this.status = STAND;
            }
            if (distance>=1.5) {
                this.lastPos = this.curPos;
                this.curPos = latLng;
                let heading = turf.bearing(
                    turf.point([this.lastPos.lng, this.lastPos.lat]),
                    turf.point([this.curPos.lng, this.curPos.lat])
                );
                this.dir = (heading + 360) % 360;
                this.speed = (distance * 1000) / (1000 * 60 *(curTime-this.lastUpdate)); // Km/h
                if (this.speed <= 6) {
                    this.status = WALK;
                    console.log("Walking at ",this.speed,"Km/h");
                    logger("Walking at "+this.speed+"Km/h");
                } else if (this.speed > 6) {
                    this.status = RUN;
                    console.log("Running at ",this.speed,"Km/h");
                    logger("Running at "+this.speed+"Km/h");
                }
            }
            this.lastDistance = distance;
            this.lastUpdate = curTime;
        }
        this.renderWalk(map);
    }

    this.renderWalk = function(map) {
        if (this.status == STAND) {
            this.fadeOut(map,this.fadeIn(map,L.marker(this.curPos, {icon: this.leftShoeIcon,rotationAngle: this.dir}),500));
            this.fadeOut(map,this.fadeIn(map,L.marker(this.curPos, {icon: this.rightShoeIcon,rotationAngle: this.dir}),500));
            this.curFoot = BOTH;          
            if (this.scrollMarker == null) {
                this.scrollMarker = this.fadeIn(map,L.marker(this.curPos, {icon: this.scroll}),1000);
                console.log(this.scrollMarker);
            }
        } else if (this.status == WALK || this.status == RUN) {
            this.scrollMarker.slideTo([this.curPos.lat,this.curPos.lng],2000);
            let distance = this.lastDistance;
            let turfLine = turf.lineString([[this.lastPos.lng, this.lastPos.lat],[this.curPos.lng, this.curPos.lat]])
            for (let i = 0; i < distance/2; i++) {
                // Turf Along takes in kilometers as default unit
                let point = turf.along(turfLine, i*0.002); 
                let icon;
                if (this.curFoot == LEFT) {
                    icon = this.rightShoeIcon;
                    this.curFoot = RIGHT;
                } else {
                    icon = this.leftShoeIcon;
                    this.curFoot = LEFT;
                }
                this.fadeOut(map,this.fadeIn(map,L.marker(L.latLng(point.geometry.coordinates[1],point.geometry.coordinates[0]), {icon: icon,rotationAngle: this.dir}),(i*500)));
            }
        }
    }
}