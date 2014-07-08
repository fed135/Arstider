/**
 * StateMachine
 * 
 * @version 1.5
 * @author frederic charette <fredericcharette@gmail.com>
 */

/**
 * Defines the StateMachine module
 */
define("Arstider/commons/StateMachine", ["Arstider/Events"], /** @lends commons/StateMachine */ function(Events){

	/**
	 * StateMachine constructor
	 * Stack-Based FSM 
	 * @class commons/StateMachine
	 * @constructor
	 */
	function StateMachine(){
		this.stack = [];
		this.prevState = null;
	}

	StateMachine.prototype.update = function(){
		var currentState = this.getCurrentState();
		if(currentState.fct) currentState.fct.apply(currentState.caller);
		if(currentState.evt && (this.prevState != currentState)) Events.broadcast(currentState.evt, currentState.caller);
		this.prevState = currentState;
		return this;
	};

	StateMachine.prototype.popState = function(){
		this.stack.pop();
		return this;
	};

	StateMachine.prototype.pushState = function(fct, caller, evt){
		if(this.getCurrentState() != fct){
			this.stack.push({
				fct:fct,
				caller:Arstider.checkIn(caller, this),
				evt:evt
			});
		}
		return this;
	};

	StateMachine.prototype.getCurrentState = function(){
		return this.stack.length > 0 ? this.stack[this.stack.length - 1] : null;
	};

	return StateMachine;
});