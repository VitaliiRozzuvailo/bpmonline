define("MapsHelper", ["MapsHelperResources", "AddressHelper"], function(resources, AddressHelper) {

	/**
	 * Возвращает результат проверки на отсутствие адреса.
	 * @obsolete
	 * @return {boolean} Результат проверки на отсутствие адреса.
	 */
	var getIsEmptyAddress = function() {
		window.console.warn(Ext.String.format(
            Terrasoft.Resources.ObsoleteMessages.ObsoleteMethodMessage,
				"getIsEmptyAddress", "AddressHelper.getIsEmptyAddress"));
		return AddressHelper.getIsEmptyAddress.apply(this, arguments);
	};

	/**
	 * Возвращает полный адрес.
	 * @obsolete
	 * @return {Array} Полный адрес.
	 */
	var getFullAddress = function() {
		window.console.warn(Ext.String.format(
				Terrasoft.Resources.ObsoleteMessages.ObsoleteMethodMessage,
				"getFullAddress", "AddressHelper.getFullAddress"));
		return AddressHelper.getFullAddress.apply(this, arguments);
	};

	/**
	 * Подготавливает адрес.
	 * @obsolete
	 * @return {Object} Объект адреса.
	 */
	var getMapsConfig = function() {
		window.console.warn(this.Ext.String.format(
				this.Terrasoft.Resources.ObsoleteMessages.ObsoleteMethodMessage,
				"getMapsConfig", "AddressHelper.getMapsConfig"));
		return AddressHelper.getMapsConfig.apply(this, arguments);
	};

	/**
	 * Передает адрес модулю карт.
	 * @obsolete
	 */
	var sendMapsConfig = function() {
		window.console.warn(this.Ext.String.format(
				this.Terrasoft.Resources.ObsoleteMessages.ObsoleteMethodMessage,
				"sendMapsConfig", "AddressHelper.sendMapsConfig"));
		return AddressHelper.sendMapsConfig.apply(this, arguments);
	};

	/**
	 * Обработчик изменения адреса.
	 * @obsolete
	 */
	var onAddressChanged = function() {
		window.console.warn(this.Ext.String.format(
				this.Terrasoft.Resources.ObsoleteMessages.ObsoleteMethodMessage,
				"onAddressChanged", "AddressHelper.onAddressChanged"));
		return AddressHelper.onAddressChanged.apply(this, arguments);
	};

	/**
	 * Обработчик изменения координат.
	 * @obsolete
	 */
	var onCoordinatesChanged = function() {
		window.console.warn(this.Ext.String.format(
				this.Terrasoft.Resources.ObsoleteMessages.ObsoleteMethodMessage,
				"onCoordinatesChanged", "AddressHelper.onCoordinatesChanged"));
		return AddressHelper.onCoordinatesChanged.apply(this, arguments);
	};

	/**
	 * Обрабатывает координаты от модуля карт в карточке.
	 * @obsolete
	 */
	var processCoordinatesChange = function() {
		window.console.warn(this.Ext.String.format(
				this.Terrasoft.Resources.ObsoleteMessages.ObsoleteMethodMessage,
				"processCoordinatesChange", "AddressHelper.processCoordinatesChange"));
		return AddressHelper.processCoordinatesChange.apply(this, arguments);
	};

	/**
	 * Формирует массив адресов по идентификаторам контактов|контрагентов.
	 * @obsolete
	 */
	var openShowOnMap = function() {
		window.console.warn(this.Ext.String.format(
				this.Terrasoft.Resources.ObsoleteMessages.ObsoleteMethodMessage,
				"openShowOnMap", "AddressHelper.openShowOnMap"));
		return AddressHelper.openShowOnMap.apply(this, arguments);
	};

	/**
	 * Идентификатор маски загрузки.
	 */
	var currentMaskId;

	/**
	 * Отобразить маску загрузки.
	 * @param {Boolean} showOnMap отобразить в модуле карт (если true отображает маску в контейнере maps-container).
	 */
	var showMask = function(showOnMap) {
		var selector = "maps-container";
		currentMaskId = currentMaskId || (showOnMap && Ext.get(selector)
				? Terrasoft.Mask.show({selector: "#" + selector})
				: Terrasoft.Mask.show());
	};

	/**
	 * Скрыть маску загрузки.
	 */
	var hideMask = function() {
		if (!Ext.isEmpty(currentMaskId)) {
			Terrasoft.Mask.hide(currentMaskId);
			currentMaskId = null;
		}
	};

	return {
		getIsEmptyAddress: getIsEmptyAddress,
		getFullAddress: getFullAddress,
		getMapsConfig: getMapsConfig,
		sendMapsConfig: sendMapsConfig,
		onAddressChanged: onAddressChanged,
		onCoordinatesChanged: onCoordinatesChanged,
		processCoordinatesChange: processCoordinatesChange,
		openShowOnMap: openShowOnMap,
		showMask: showMask,
		hideMask: hideMask
	};
});
