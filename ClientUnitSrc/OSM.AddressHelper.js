define("AddressHelper", ["AddressHelperResources"], function(resources) {
	/**
	 * Возвращает преобразованный адрес.
	 * @param {Object|String} address Адрес.
	 * @return {String} Преобразованный адрес.
	 */
	var getAddress = function(address) {
		if (this.Ext.isObject(address)) {
			return address.displayValue;
		} else if (!this.Ext.isEmpty(address)) {
			return address;
		}
		return null;
	};

	/**
	 * Возвращает результат проверки на отсутствие адреса.
	 * @param {Array|String} address Адрес.
	 * @return {boolean} Результат проверки на отсутствие адреса.
	 */
	var getIsEmptyAddress = function(address) {
		var result = true;
		if (!Ext.isEmpty(address)) {
			if (Ext.isArray(address)) {
				address.forEach(function(item) {
					if (!Ext.isEmpty(item)) {
						result = false;
					}
				}, this);
			} else {
				result = false;
			}
		}
		return result;
	};

	/**
	 * Возвращает полный адрес.
	 * @return {Array} Полный адрес.
	 */
	var getFullAddress = function() {
		var fullAddress = [];
		fullAddress.push(getAddress(this.get("Country")));
		fullAddress.push(getAddress(this.get("Region")));
		fullAddress.push(getAddress(this.get("City")));
		fullAddress.push(getAddress(this.get("Address")));
		return fullAddress;
	};

	/**
	 * Подготавливает адрес.
	 * @param {Boolean} ignoreCoordinates игнорировать координаты.
	 * @return {Object} Объект адреса.
	 */
	var getMapsConfig = function(ignoreCoordinates) {
		var fullAddress = this.getFullAddress();
		var latitude = this.get("Latitude");
		var longitude = this.get("Longitude");
		var mapsData = [];
		var mapsConfig = {
			mapsData: mapsData
		};
		if (!Ext.isEmpty(latitude) && !Ext.isEmpty(longitude) && !ignoreCoordinates) {
			mapsData.push({
				content: this.getPopUpConfig(),
				address: latitude + ", " + longitude,
				gpsN: latitude,
				gpsE: longitude,
				useDragMarker: true
			});
		} else if (!getIsEmptyAddress(fullAddress)) {
			mapsData.push({
				content: this.getPopUpConfig(),
				address: fullAddress,
				useDragMarker: true
			});
		} else {
			mapsConfig.useCurrentUserLocation = true;
		}
		return mapsConfig;
	};

	/**
	 * Передает адрес модулю карт.
	 * @param {Object} mapsConfig объект адреса.
	 */
	var sendMapsConfig = function(mapsConfig) {
		var moduleId = this.sandbox.id + "_MapsModule";
		if (!this.Ext.isEmpty(mapsConfig)) {
			this.sandbox.publish("SetMapsConfig", mapsConfig, [moduleId]);
		}
	};

	/**
	 * Обработчик изменения адреса.
	 */
	var onAddressChanged = function() {
		if (!this.get("IsEntityInitialized")) {
			return;
		}
		var mapsConfig = this.getMapsConfig(true);
		sendMapsConfig.call(this, mapsConfig);
	};

	/**
	 * Обработчик изменения координат.
	 */
	var onCoordinatesChanged = function() {
		if (!this.get("IsEntityInitialized") || this.get("IsCoordinatesChanged")) {
			return;
		}
		var mapsConfig = this.getMapsConfig();
		sendMapsConfig.call(this, mapsConfig);
	};

	/**
	 * Округляет значение координат до decimalPrecision знаков после запятой.
	 * @param {String|Number} coordinate Значение координаты.
	 * @param {Number} decimalPrecision Количество знаков после запятой.
	 * @return {String} Координата.
	 */
	var roundCoordinates = function(coordinate, decimalPrecision) {
		coordinate = parseFloat(coordinate);
		return coordinate.toFixed(decimalPrecision);
	};

	/**
	 * Обрабатывает координаты от модуля карт в карточке.
	 * @param {Object} coordinates Координаты маркера.
	 */
	var processCoordinatesChange = function(coordinates) {
		this.set("IsCoordinatesChanged", true);
		var latitude = roundCoordinates(coordinates.lat, 7);
		var longitude = roundCoordinates(coordinates.lng, 7);
		if (latitude !== this.get("Latitude")) {
			this.set("Latitude", latitude);
		}
		if (latitude !== this.get("Longitude")) {
			this.set("Longitude", longitude);
		}
		this.set("IsCoordinatesChanged", false);
	};

	/**
	 * Формирует массив адресов по идентификаторам контактов|контрагентов.
	 * @param {String} schemaName Имя сущности.
	 * @param {Function} callback Функция пост обработки.
	 * @param {Array} items Массив идентификаторов.
	 */
	var openShowOnMap = function(schemaName, callback, items) {
		items = items || this.getSelectedItems();
		var select = this.Ext.create("Terrasoft.EntitySchemaQuery", {
			rootSchemaName: schemaName + "Address"
		});
		select.addColumn(schemaName + ".Name");
		select.addColumn("AddressType");
		select.addColumn("Address");
		select.addColumn("City");
		select.addColumn("Region");
		select.addColumn("Country");
		select.filters.addItem(this.Terrasoft.createColumnInFilterWithParameters(schemaName, items));
		select.getEntityCollection(function(result) {
			var addresses = result.collection;
			if (result.success && !addresses.isEmpty()) {
				var mapsData = [];
				var mapsConfig = {
					mapsData: mapsData
				};
				addresses.each(function(item) {
					var addressType = item.get("AddressType").displayValue;
					var address = getFullAddress.call(item);
					var content = this.Ext.String.format("<h2>{0}</h2><div>{1}</div>", addressType, address);
					var dataItem = {
						caption: addressType,
						content: content,
						address: address
					};
					mapsData.push(dataItem);
				}, this);
				callback.call(this, mapsConfig);
			} else {
				this.showInformationDialog(resources.localizableStrings.EmptyAddressDetailMessage);
			}
		}, this);
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