$(function() {
	$("body").effectChain({
		css: {
			opacity: 0,
			visibility: "visible"
		},
		target: "div, header",
		delay: 50,
		interval: 250,
		reverse: false,
		args: [{
			opacity: 1
		}, {
			duration: 500,
			easing: "swing"
		}]
	});
});