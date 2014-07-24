define("Arstider/Signal", [], function()
{
	function Signal()
	{
		this.listeners = [];
		this.listenersOnce = [];
	};

	Signal.prototype.dispose = function()
	{
		this.listeners=[];
		this.listenersOnce=[];
	};

	Signal.prototype.add = function(listener, prioritize, once)
	{
		if(this.listeners.indexOf(listener)<0)
		{
			this.listeners.push(listener);
		}

		if (once && this.listenersOnce.indexOf(listener)<0)
		{
			this.listenersOnce.push(listener);
		}

		return this;
	};

	Signal.prototype.addOnce = function(listener, prioritize)
	{
		return this.add(listener, prioritize, true);
	};

	Signal.prototype.remove = function(listener)
	{
		var index = this.listeners.indexOf(listener);
		if (index >= 0) {
			this.listeners.splice(index, 1);
		}

		// once() listener?
		var onceIndex = this.listenersOnce.indexOf(listener);
		if (onceIndex >= 0) {
			this.listenersOnce.splice(onceIndex, 1);
		}
	};

	Signal.prototype.dispatch = function()
	{
		var args = Array.prototype.slice.call(arguments);
		var n = this.listeners.length;
		var listener;

		for (var i = 0; i < n; i++)
		{
			listener = this.listeners[i];
			listener.apply(null, args);

			// once() listener?
			var onceIndex = this.listenersOnce.indexOf(listener);
			if (onceIndex >= 0) {
				this.remove(listener);
			}
		};
	};

	return Signal;
});