define("WebitelConfigurationConstants", [], function() {

	/**
	 * Справочник ролей пользователей Webitel.
	 * @type {Object}
	 */
	var wSysAccountRole = {
		/** Администратор. */
		Administrator: "85f6f2c0-16c5-40f4-bb75-becad578d495",
		/** Пользователь. */
		User: "7640dfbd-0cf2-4040-998e-4641042eff46"
	};

	/**
	 * Объект кодов ошибок Webitel.
	 * @type {Object}
	 */
	var webitelErrorCode = {
		/** При создании пользователя Webitel: "Пользователь Webitel с указанным номером уже существует". */
		UserAlreadyExists: "-ERR: Number exists"
	};

	return {
		WSysAccountRole: wSysAccountRole,
		WebitelErrorCode: webitelErrorCode
	};
});