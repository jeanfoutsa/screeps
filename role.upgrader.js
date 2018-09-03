// @formatter:off

/**
//
// _________________________________________________________
//                                          ___              
//            |\ |   |   |    |_/    |_|   |   |             
//            | \|   |___|    | |     |    |___|             
//                                                          
//______________________ Screeps AI ________________________
//
//
//
**/

// Code should be executed in "strict mode" as it make it easier to write "secure" JavaScript.
"use strict";

// @formatter:on

const tasks = require('tasks');

const roleUpgrader = {

    /** 
	* Upgrader creep role function.
	* @param {Creep} creep - The creep with upgrader memory in the room. Avoid controller downgrade.
	**/
    run: function(creep) {

        if(creep.memory.upgrading && creep.carry.energy == 0) {
			creep.memory.sourceNr = undefined;
            creep.memory.upgrading = false;
            creep.say('getting');
        }
        if(!creep.memory.upgrading && creep.carry.energy == creep.carryCapacity) {
            creep.memory.upgrading = true;
            creep.say('upgrading');
        }

        if(creep.memory.upgrading) {
            if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller);
            }
			// Sign controller if last sign date over 1 day
			if(creep.room.controller.sign.time + 28000 < Game.time || creep.room.controller.sign.username != 'Nukyo')
			{
				if(creep.signController(creep.room.controller, "I come in peace.") == ERR_NOT_IN_RANGE) {
					creep.moveTo(creep.room.controller);
				}
			}
        }
        else {
			if(creep.ticksToLive < 100){
				creep.memory.role = 'recycler';
			}
			else {
				//go get NRG in priority: dropped, container, storage, harvest
				tasks.gogetNRG(creep);
			}
        }
    }
};

module.exports = roleUpgrader;