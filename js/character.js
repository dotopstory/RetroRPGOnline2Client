
define(['entity', 'transition', 'timer', 'mobdata', 'npcdata'], function(Entity, Transition, Timer, MobData, NpcData) {

    var Character = Entity.extend({
        init: function(id, kind) {
            var self = this;

            this._super(id, kind);

            // Position and orientation
            this.nextGridX = -1;
            this.nextGridY = -1;
            this.prevGridX = -1;
            this.prevGridY = -1;

            this.orientation = Types.Orientations.DOWN;

            /*
             * Have to handle this
             * server side
             * then have it sent using gameclient
             */

            // Speeds
            this.atkSpeed = 250;
            this.moveSpeed = 350;
            this.walkSpeed = 350;
            this.idleSpeed = randomInt(750,1000);
            this.setAttackRate(1024);

            // Pathing
            this.movement = new Transition();
            this.path = null;
            this.newDestination = null;
            this.adjacentTiles = {};

            // Combat
            this.target = null;
            this.unconfirmedTarget = null;
            this.attackers = {};

            // Health
            this.hitPoints = 0;
            this.maxHitPoints = 0;

            // Fatigue
            this.maxFatigue = 0;
            this.fatigue = 0;

            // Modes
            this.isDead = false;
            this.attackingMode = false;
            this.followingMode = false;
            this.engagingPC = false;
            this.inspecting = null;

            this.isStunned = false;

            this.isReadyToMove = true;

            this.setMoveRate(this.moveSpeed);

            this.updateCharacter = false;
            this.joystickTime = 0;
            this.requestMove = false;
        },

        clean: function() {
            this.forEachAttacker(function(attacker) {
                attacker.disengage();
                attacker.idle();
            });
        },

        setMaxHitPoints: function(hp) {
            this.maxHitPoints = hp;
            this.hitPoints = hp;
        },
        setMaxFatigue: function(fatigue) {
            this.maxFatigue = fatigue;
            this.fatigue = fatigue;
	    },
        setDefaultAnimation: function() {
            this.idle();
        },
        setAtkRange: function(range) {
            this.atkRange = range;
        },

        hasWeapon: function() {
            return false;
        },

        hasShadow: function() {
            return true;
        },

        animate: function(animation, speed, count, onEndCount) {
            var oriented = ['atk', 'walk', 'idle'],
                o = this.orientation;

            //if(!(this.currentAnimation && this.currentAnimation.name === "death")) { // don't change animation if the character is dying
                this.flipSpriteX = false;
                this.flipSpriteY = false;

                if(_.indexOf(oriented, animation) >= 0) {
                    animation += "_" + (o === Types.Orientations.LEFT ? "right" : Types.getOrientationAsString(o));
                    this.flipSpriteX = (this.orientation === Types.Orientations.LEFT) ? true : false;
                }

                this.setAnimation(animation, speed, count, onEndCount);
            //}
        },

        turnTo: function(orientation) {
            this.orientation = orientation;
            this.idle();
        },

        setOrientation: function(orientation) {
            if(orientation) {
                this.orientation = orientation;
            }
        },

        idle: function(orientation) {
            this.setOrientation(orientation);
            this.animate("idle", this.idleSpeed);
        },

        hit: function(orientation) {
            this.setOrientation(orientation);
            this.animate("atk", this.atkSpeed, 1);
            //this.stop();
        },

        walk: function(orientation) {
            this.setOrientation(orientation);
            this.animate("walk", this.walkSpeed);
        },

        moveTo_: function(x, y, callback) {
            var self = this;
            this.destination = { gridX: x, gridY: y };
            this.adjacentTiles = {};
            this.isReadyToMove = false;

            if(this.isMoving()) {
                this.continueTo(x, y);
            }
            else {
                var path = this.requestPathfindingTo(x, y);
                if (!path || path.length == 0) {
                	this.forceStop();
                	log.info("follow path failed entity id="+this.id+",x="+x+",y="+y+",gridX="+this.gridX+",gridY="+this.gridY);
                	return;
                }
                //log.info("followPath:"+JSON.stringify(path));
                if (this.joystickTime >= gLatency)
                {
                  this.followPath(path);
                }
                else {
                  if (!this.requestMove)
                  {
                    setTimeout( function() {
                      self.followPath(path);
                      self.requestMove = false;
                    }, gLatency);
                    self.requestMove = true;
                  }
                }
            }
        },

        requestPathfindingTo: function(x, y) {
        	if (Array.isArray(this.path) && this.path.length>0 && this.step==0) {
            	return this.path;
        	} else if(this.request_path_callback) {
                return this.request_path_callback(x, y);
            } else {
                log.error(this.id + " couldn't request pathfinding to "+x+", "+y);
                return [];
            }
        },

        onRequestPath: function(callback) {
            this.request_path_callback = callback;
        },

        onStartPathing: function(callback) {
            this.start_pathing_callback = callback;
        },

        onStopPathing: function(callback) {
            this.stop_pathing_callback = callback;
        },

        followPath: function(path) {
            if(path.length > 1) { // Length of 1 means the player has clicked on himself
            	this.path = path;
                this.step = 0;

                if(this.followingMode) { // following a character
                    path.pop();
                    log.info("POPPED");
                }

                if(this.start_pathing_callback) {
                    this.start_pathing_callback(path);
                }
                if(this.before_move_callback) {
                    this.before_move_callback();
                }

                this.nextStep();
            }
        },

        continueTo: function(x, y) {
            this.newDestination = { x: x, y: y };
        },

        updateMovement: function() {
            var p = this.path,
                i = this.step;

            if(p[i][0] < p[i-1][0]) {
                this.walk(Types.Orientations.LEFT);
            }
            if(p[i][0] > p[i-1][0]) {
                this.walk(Types.Orientations.RIGHT);
            }
            if(p[i][1] < p[i-1][1]) {
                this.walk(Types.Orientations.UP);
            }
            if(p[i][1] > p[i-1][1]) {
                this.walk(Types.Orientations.DOWN);
            }
        },

        updateMovement2: function() {
            var p = this.path,
                i = this.step;

            if(p[i][0] < p[i+1][0]) {
                this.walk(Types.Orientations.RIGHT);
            }
            if(p[i][0] > p[i+1][0]) {
                this.walk(Types.Orientations.LEFT);
            }
            if(p[i][1] < p[i+1][1]) {
                this.walk(Types.Orientations.DOWN);
            }
            if(p[i][1] > p[i+1][1]) {
                this.walk(Types.Orientations.UP);
            }
        },

        updatePositionOnGrid: function() {
            this.setGridPosition(this.path[this.step][0], this.path[this.step][1]);
        },

        nextStep: function() {
            var stop = false,
                x, y, path;

            this.prevGridX = this.gridX;
            this.prevGridY = this.gridX;

            if(this.isMoving()) {
                if(this.before_step_callback) {
                    this.before_step_callback();
                }

                this.updatePositionOnGrid();
                this.checkAggro();

                if(this.interrupted) { // if Character.stop() has been called
                    stop = true;
                    this.moving = false;
                    this.interrupted = false;
                }
                else {
                    if(this.hasNextStep()) {
                        this.nextGridX = this.path[this.step+1][0];
                        this.nextGridY = this.path[this.step+1][1];
                    }

                    if(this.step_callback) {
                        this.step_callback();
                    }

                    if(this.hasChangedItsPath()) {
                        x = this.newDestination.x;
                        y = this.newDestination.y;
                        path = this.requestPathfindingTo(x, y);

                        this.newDestination = null;
                        if(path.length < 2) {
                            stop = true;
                        }
                        else {
                            this.followPath(path);
                        }
                    }
                    else if(this.hasNextStep()) {
                        this.step += 1;
                        this.updateMovement();
                    }
                    else {
                        stop = true;
                    }
                }

                if(stop) { // Path is complete or has been interrupted
    		        this.path = null;
    		        this.idle();

    		        if (this.engagingPC) {
    		            this.followingMode = false;
    		            this.engagingPC = false;
    		        }
                    if(this.stop_pathing_callback) {
                        this.stop_pathing_callback(this.gridX, this.gridY);
                    }
        		}
        	}
        },

        onBeforeMove: function(callback) {
            this.before_move_callback = callback;
        },

        onBeforeStep: function(callback) {
            this.before_step_callback = callback;
        },

        onStep: function(callback) {
            this.step_callback = callback;
        },

        isMoving: function() {
            return this.path && this.path.length > 0;
        },

        hasNextStep: function() {
        	 return (this.path && this.path.length - 1 > this.step);
        },

        hasChangedItsPath: function() {
            return !(this.newDestination === null);
        },

        isNear: function(character, distance) {
            var dx, dy, near = false;

            dx = Math.abs(this.gridX - character.gridX);
            dy = Math.abs(this.gridY - character.gridY);

            if(dx <= distance && dy <= distance) {
                near = true;
            }
            return near;
        },

        onAggro: function(callback) {
            this.aggro_callback = callback;
        },

        onCheckAggro: function(callback) {
            this.checkaggro_callback = callback;
        },

        checkAggro: function() {
            if(this.checkaggro_callback) {
                this.checkaggro_callback();
            }
        },

        aggro: function(character) {
            if(this.aggro_callback) {
                this.aggro_callback(character);
            }
        },

        onDeath: function(callback) {
            this.death_callback = callback;
        },

        /**
         * Changes the character's orientation so that it is facing its target.
         */
        lookAtTarget: function() {
            if(this.target) {
                //this.turnTo(this.getOrientationTo(this.target));
            }
        },

        lookAtTarget2: function(target) {
            if(target) {
                //this.turnTo(this.getOrientationTo(target));
            }
        },

        lookAt: function(gridX, gridY) {
            this.turnTo(this.getOrientationTo({gridX: gridX, gridY: gridY}));
        },

        /**
         *
         */
        go: function(x, y) {
            if(this.isAttacking()) {
                this.disengage();
            }
            else if(this.followingMode) {
                this.followingMode = false;
                this.target = null;
            }
            this.moveTo_(x, y);
        },


        /**
         * Makes the character follow another one.
         */
        follow: function(entity, engagingPC) {
            if (NpcData.Kinds[entity.kind])
            {
                this.followingMode = true;
                this.moveTo_(entity.gridX, entity.gridY);
            	return;
            }

        	//this.engagingPC = engagingPC === undefined ? false : engagingPC
            //if (entity && ((this.engagingPC && this.kind === 1) || (this.engagingPC == false && entity.kind != 1) || (this.kind !== 1))) {
            	//log.info("pClass="+this.pClass);

            	if ((this.pClass==Types.PlayerClass.ARCHER || this.pClass==Types.PlayerClass.MAGE) && isMob(entity.id))
            	{
            		log.info("Archer or mage ranged attack");
            		return;
            	}
                this.followingMode = true;
                this.moveTo_(entity.gridX, entity.gridY);
            //}
        },


        /**
         * Stops a moving character.
         */
        stop: function() {
            if(this.isMoving()) {
                this.interrupted = true;
                this.moving = false;
            }
        },

        /**
         * Makes the character attack another character. Same as Character.follow but with an auto-attacking behavior.
         * @see Character.follow
         */
        engage: function(character) {
            this.attackingMode = true;
            this.setTarget(character);
            var engagingPC = false;
            if (this.kind === 1 && character.kind === 1) {
                engagingPC = true;
            }
            this.follow(character, engagingPC);
        },
        disengage: function() {
            this.attackingMode = false;
            this.followingMode = false;
            this.removeTarget();
        },
        /**
         * Returns true if the character is currently attacking.
         */
        isAttacking: function() {
            return this.attackingMode;
        },

        /**
         * Gets the right orientation to face a target character from the current position.
         * Note:
         * In order to work properly, this method should be used in the following
         * situation :
         *    S
         *  S T S
         *    S
         * (where S is self, T is target character)
         *
         * @param {Character} character The character to face.
         * @returns {String} The orientation.
         */
        getOrientationTo: function(object) {
            if(this.gridX < object.gridX) {
                return Types.Orientations.RIGHT;
            } else if(this.gridX > object.gridX) {
                return Types.Orientations.LEFT;
            } else if(this.gridY > object.gridY) {
                return Types.Orientations.UP;
            } else {
                return Types.Orientations.DOWN;
            }
        },

        /**
         * Returns true if this character is currently attacked by a given character.
         * @param {Character} character The attacking character.
         * @returns {Boolean} Whether this is an attacker of this character.
         */
        isAttackedBy: function(character) {
        	if (this.attackers.size == 0) {
        		return false;
        	}
            return (character.id in this.attackers);
        },

        /**
        * Registers a character as a current attacker of this one.
        * @param {Character} character The attacking character.
        */
        addAttacker: function(character) {
            if(!this.isAttackedBy(character)) {
                this.attackers[character.id] = character;
            } else {
                log.error(this.id + " is already attacked by " + character.id);
            }
        },

        /**
        * Unregisters a character as a current attacker of this one.
        * @param {Character} character The attacking character.
        */
        removeAttacker: function(character) {
            if (this.attackers.size == 0) {
            	    return;
            }
            if(this.isAttackedBy(character)) {
                delete this.attackers[character.id];
            } else {
                log.info(this.id + " is not attacked by " + character.id);
            }
        },
        forceStop: function () {
    	    if (this.isMoving()) {
    	        //this.interrupted = true;
    	        this.path = null;
    	        this.newDestination = null;
    	        this.idle();
    	        if (this.engagingPC) {
    	            this.followingMode = false;
    	            this.engagingPC = false;
    	        }
    	        this.isReadyToMove = true;
    	    }
    	},
        /**
         * Loops through all the characters currently attacking this one.
         * @param {Function} callback Function which must accept one character argument.
         */
        forEachAttacker: function(callback) {
            _.each(this.attackers, function(attacker) {
                callback(attacker);
            });
        },

        /**
         * Sets this character's attack target. It can only have one target at any time.
         * @param {Character} character The target character.
         */
        setTarget: function(character) {
             if (character == null) {
             	     this.removeTarget();
             	     return;
             }
             if(this.target !== character) { // If it's not already set as the target
                if(this.hasTarget()) {
                    this.removeTarget(); // Cleanly remove the previous one
                }
                this.unconfirmedTarget = null;
                this.target = character;
                if(this.settarget_callback){
                    var targetName = this.target.spriteName;
                    if (MobData.Kinds[character.kind] && targetName)
                        this.settarget_callback(character, targetName, character.level);
                }
            } else {
                log.debug(character.id + " is already the target of " + this.id);
            }
        },
        onSetTarget: function(callback) {
          this.settarget_callback = callback;
        },
        showTarget: function(character) {
          if(this.inspecting !== character && character !== this){
            this.inspecting = character;
            if(this.settarget_callback && this.target){

              var targetName;
              var mobData = MobData.Kinds[character.kind];
              if (mobData)
              {
              	  if (mobData.spriteName)
              	      targetName = mobData.spriteName;
                  else
                      targetName = mobData.key;
              }

              else if (isItem(character.id)) {
              	      targetName = ItemTypes.getKindAsString(character.kind);
              }
              this.settarget_callback(character, targetName, character.level, true);
            }
          }
        },


        /**
         * Removes the current attack target.
         */
        removeTarget: function() {
            var self = this;

            if(this.target) {
                if(this.target instanceof Character) {
                    this.target.removeAttacker(this);
                }
		    if (this.removetarget_callback)
			    this.removetarget_callback(this.target.id);

                this.target = null;
            }
        },
        onRemoveTarget: function(callback){
            this.removetarget_callback = callback;
        },

        /**
         * Returns true if this character has a current attack target.
         * @returns {Boolean} Whether this character has a target.
         */
        hasTarget: function() {
            return !(this.target === null);
        },

        /**
         * Marks this character as waiting to attack a target.
         * By sending an "attack" message, the server will later confirm (or not)
         * that this character is allowed to acquire this target.
         *
         * @param {Character} character The target character
         */
        waitToAttack: function(character) {
            this.unconfirmedTarget = character;
        },

        /**
         * Returns true if this character is currently waiting to attack the target character.
         * @param {Character} character The target character.
         * @returns {Boolean} Whether this character is waiting to attack.
         */
        isWaitingToAttack: function(character) {
            return (this.unconfirmedTarget === character);
        },

        /**
         *
         */
        canAttack: function(time) {
            if(this.isDead == false && this.canReachTarget() && this.attackCooldown.isOver(time)) {
                return true;
            }
            return false;
        },

        canReachTarget: function() {
            if(this.atkRange > 1){
                if(this.hasTarget() && this.getDistanceToEntity(this.target) < this.atkRange) {
                    return true;
                }
            } else{
                if(this.hasTarget() && this.isAdjacentNonDiagonal(this.target)) {
                    return true;
                }
            }
            return false;
        },


        /**
         *
         */
        die: function(blood) {
            this.removeTarget();
            this.isDead = true;

            if(this.death_callback) {
                this.death_callback(blood);
            }
        },

        onHasMoved: function(callback) {
            this.hasmoved_callback = callback;
        },

        hasMoved: function() {
            //this.setDirty();
            if(this.hasmoved_callback) {
                this.hasmoved_callback(this);
            }
        },

        hurt: function() {
            var self = this;

            this.stopHurting();
            this.sprite = this.hurtSprite;
            this.hurting = setTimeout(this.stopHurting.bind(this), 75);
        },

        stopHurting: function() {
            this.sprite = this.normalSprite;
            clearTimeout(this.hurting);
        },

        setAttackRate: function(rate) {
            this.attackCooldown = new Timer(rate);
        },

        canReach: function(entity) {
            //log.info("attackRange: " + this.attackRange);
            if (this.gridX == entity.gridX && this.gridY && entity.gridY)
            	    return true;
            if(this.attackRange > 1){
                if(this.isNear(entity, this.attackRange)) {
                    return true;
                }
            } else{
                if(this.isAdjacentNonDiagonal(entity)) {
                    return true;
                }
            }
            return false;
        },

	    clearTarget: function () {
		this.target = null;
	    },

		getClosestSpot: function(coords1) {
			var coords = [];

			var i = coords1.gridX;
			var j = coords1.gridY;
			var d = 1;
			coords.push({d: manhattenDistance({x:this.gridX,y:this.gridY},{x:i+d,y:j}),x:i+d,y:j});
			coords.push({d: manhattenDistance({x:this.gridX,y:this.gridY},{x:i-d,y:j}),x:i-d,y:j});
			coords.push({d: manhattenDistance({x:this.gridX,y:this.gridY},{x:i,y:j-d}),x:i,y:j-d});
			coords.push({d: manhattenDistance({x:this.gridX,y:this.gridY},{x:i,y:j+d}),x:i,y:j+d});

			coords.sort(function(a,b) { return a.d-b.d; });

			return coords;
		},

        canMove: function(time) {
            if(this.isDead == false && this.moveCooldown.isOver(time)) {
                return true;
            }
            return false;
        },

        setMoveRate: function(rate) {
            this.moveSpeed = rate;
            this.walkSpeed = rate;
            this.moveCooldown = new Timer(rate);
        },

    });

    return Character;
});
