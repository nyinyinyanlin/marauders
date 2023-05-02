function Marauder(name,lShoe,rShoe) {
    const LEFT = 0;
    const RIGHT = 1;
    const BOTH = 2;
    this.name = name;
    this.lastUpdate = null;
    this.lastPos = null;
    this.curPos = null;
    this.dir = 0;
    this.curFoot = BOTH;
    this.leftShoeIcon = lShoe;
    this.rightShoeIcon = rShoe;

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
        this.lastUpdate = Date.now();
        if (this.lastPos == null) {
            this.lastPos = this.curPos = latLng;
        } else {
            this.lastPos = this.curPos;
            this.curPos = latLng;
            let heading = turf.bearing(
                turf.point([this.lastPos.lng, this.lastPos.lat]),
                turf.point([this.curPos.lng, this.curPos.lat])
            );
            this.dir = (heading + 360) % 360;
        }
        this.renderWalk(map);
    }

    this.renderWalk = function(map) {
        if (this.lastPos == this.curPos) {
            this.fadeOut(map,this.fadeIn(map,L.marker(this.curPos, {icon: this.leftShoeIcon,rotationAngle: this.dir}),500));
            this.fadeOut(map,this.fadeIn(map,L.marker(this.curPost, {icon: this.rightShoeIcon,rotationAngle: this.dir}),500));
            this.curFoot = BOTH;            
        } else if (this.lastPos.distanceTo(this.curPos)>=2) {
            let distance = this.lastPos.distanceTo(this.curPos);
            let turfLine = turf.lineString([[this.lastPos.lng, this.lastPos.lat],[this.curPos.lng, this.curPos.lat]])
            for (let i = 0; i < distance/2; i++) {
                // Turf Along takes in kilometers as default unit
                let point = turf.along(turfLine, i*0.001); 
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
        } else {
            this.fadeOut(map,L.marker(this.curPos, {icon: this.leftShoeIcon,rotationAngle: this.dir}).addTo(map));
            this.fadeOut(map,L.marker(this.curPost, {icon: this.rightShoeIcon,rotationAngle: this.dir}).addTo(map));
            this.curFoot = BOTH;
        }
    }
}