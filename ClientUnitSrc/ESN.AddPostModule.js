define("AddPostModule", [], function() {
	/**
	 * Открывает ленту с фокусом на поле ввода
	 * @param config
	 */
	function addPost(config) {
		config.sandbox.publish("PushHistoryState", {
			hash: "SectionModuleV2/ESNFeedSectionV2",
			stateObj: {
				focusAddPost: true,
				moduleId: config.sandbox.id + "_ESNFeedSection"
			}
		});
	}

	return {
		Run: addPost
	};
});