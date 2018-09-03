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

const roleReserver = {

    /** 
	* Reserver creep role function.
	* @param {Creep} creep - The creep with reserver memory. Claim distant room.
	**/
    run: function(creep) {
		
		const thisflag = Game.flags[creep.memory.myflag];
		
		if(creep.hits < creep.hitsMax){
				creep.memory.role = 'recycler';
		}
		else if(thisflag != undefined){
			const closeto = creep.pos.inRangeTo(thisflag,4);
			if(closeto){
				const con = _.filter(thisflag.pos.lookFor(LOOK_STRUCTURES), (s) => s.structureType == STRUCTURE_CONTROLLER)[0];
				if (creep.room.controller.owner == undefined) {
					if(/claim/.test(thisflag)){
                        if(creep.claimController(con) == ERR_NOT_IN_RANGE){
							creep.moveTo(con);
						}
                    }
                    else {
                        if(creep.reserveController(con) == ERR_NOT_IN_RANGE){
							creep.moveTo(con);
						}
						// Sign controller if last sign date over 1 day
						if(con.sign.time + 28000 < Game.time || con.sign.username != 'Nukyo')
						{
							if(creep.signController(con, "Claiming this room in a few days.") == ERR_NOT_IN_RANGE) {
								creep.moveTo(con);
							}
						}
                    }
				}
				else creep.memory.role = 'recycler';
			}
			else{
				tasks.gototarget(creep,thisflag);
			}
		}
    }
};

module.exports = roleReserver;