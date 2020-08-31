const VoiceMeeter = require('voicemeeter-connector');

function sleep(milliseconds) {
    const date = Date.now();
    let currentDate = null;
    do {
        currentDate = Date.now();
    } while (currentDate - date < milliseconds);
}

class VoiceMeeterModification{
    constructor(bus, id, param, value) {
        this.index = id;
        this.property = param;
        this.value = value;
        this.bus = bus;
    }
}

// -> Activation Timestamp: time of activation after redemption
// -> modification: What we want to change
// -> duration: how long does this last
class VoiceMeeterEvent {
    constructor(appliedModifications, duration){
        this.modifications = appliedModifications;
        this.duration = duration;
        this.activated = false;
    }

    activateModification(vm){
        if (!this.activated) {
            var d = new Date();
            this.activationTime = d.getTime();
               
            this.defaultMods = [];
            this.modifications.forEach(mod => {
                if (mod.bus) {
                    this.defaultMods.push(new VoiceMeeterModification(true, mod.index, mod.property, vm.getBusParameter(mod.index, mod.property)));
                    vm.setBusParameter(mod.index, mod.property, mod.value);
                } else {
                    this.defaultMods.push(new VoiceMeeterModification(false, mod.index, mod.property, vm.getStripParameter(mod.index, mod.property)));
                    vm.setStripParameter(mod.index, mod.property, mod.value);
                }
            });

            this.activated = true;
        }
    }

    shouldRemoveModification(){
        var d = new Date();
        return this.activated && d.getTime() - this.duration > this.activationTime
    }

    removeModification(vm){
        this.defaultMods.forEach(mod => {
            if (mod.bus) {
                vm.setBusParameter(mod.index, mod.property, mod.value);
            } else {
                vm.setStripParameter(mod.index, mod.property, mod.value);
            }
        });
    }
}

exports.VoiceMeeterModification = VoiceMeeterModification;
exports.VoiceMeeterEvent = VoiceMeeterEvent;