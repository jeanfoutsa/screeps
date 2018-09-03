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

const roleKiller = {

    /** 
	* Killer creep role function.
	* @param {Creep} creep - The creep with killer memory. Attack enemy room.
	**/
    run : function(creep){
        let myflag = Game.flags[creep.memory.myflag];
        if(myflag == undefined){
            myflag = Game.flags['kill'];
        }
        if(creep.room.name == myflag.pos.roomName){
			const towers = creep.room.find(FIND_STRUCTURES, {
						filter: (structure) => {
						return (structure.structureType == STRUCTURE_TOWER) && structure.energy > 0;
						}
			});
			if (towers.length){
				creep.moveTo(Game.rooms[creep.memory.homeRoom]);
			}
			else {
				const targets = _.filter(myflag.pos.lookFor(LOOK_STRUCTURES),(s) => s.structureType != STRUCTURE_ROAD && s.structureType != STRUCTURE_CONTROLLER);
				let target = undefined;
				if (targets.length){
					target = targets[0];
				}
				else{
					target = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
				}
				if(target == undefined){
					target = myflag.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES,{filter:(s) => s.structureType != STRUCTURE_ROAD && s.structureType != STRUCTURE_CONTROLLER});
				}
				if(target == undefined){
					creep.moveTo(myflag,{reusePath:0});
				}
				creep.attack(target);
				creep.moveTo(target,{reusePath:0});
				//if(creep.attack(target) == ERR_NOT_IN_RANGE){
				//    creep.moveTo(target,{reusePath:0});
				//}
			}
            
        }
        else{
            if(creep.memory.waypoint == undefined){
                creep.memory.waypoint = [];
            }
            const wayPoint = Game.flags[creep.memory.waypoint[0]];
            if(wayPoint != undefined){
                if(creep.room.name == wayPoint.pos.roomName){
                    creep.memory.waypoint.shift();
                }
                creep.moveTo(wayPoint);
            }
            else{
                tasks.gototarget(creep,myflag);
            }
        }
    }
};

module.exports = roleKiller;