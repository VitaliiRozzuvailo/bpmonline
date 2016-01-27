define("WebitelModuleHelper", [],
	function() {

		/**
		 * Возвращает название сервера.
		 * @returns {String} Название сервера.
		 */
		function getHostName() {
			return location.hostname.replace("www.", "");
		}

		return {
			getHostName: getHostName
		};
	});