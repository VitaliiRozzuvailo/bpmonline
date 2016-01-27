define("OsmMapsModule", ["OsmMapsModuleResources", "MapsUtilities", "ModalBox", "MapsHelper",
			"BaseSchemaModuleV2", "Leaflet", "css!Leaflet", "css!OsmMapsModule"],
		function(resources, MapsUtilities, ModalBox, MapsHelper) {
			/**
			 * Объект для работы с Leaflet. По умолчанию window.L.
			 * @type {Object}
			 */
			var L = window.L;
			/**
			 * @class Terrasoft.configuration.OsmMapsModule.
			 * Класс MapsModule предназначен для создания модуля карт OpenStreetMap.
			 */
			Ext.define("Terrasoft.configuration.OsmMapsModule", {
				alternateClassName: "Terrasoft.OsmMapsModule",
				extend: "Terrasoft.BaseModule",
				Ext: null,
				sandbox: null,
				Terrasoft: null,

				/**
				 * Инициализирует модуль.
				 */
				init: function() {
					var mapData = this.sandbox.publish("GetMapsConfig", null, [this.sandbox.id]);
					var viewModel = this.Ext.create("Terrasoft.BaseViewModel", this.generateViewModel());
					if (mapData) {
						viewModel.set("IsModalBox", mapData.isModalBox);
						viewModel.set("RenderTo", mapData.renderTo);
						viewModel.setLocation(mapData);
					}
					this.subscribeSandboxEvents.call(viewModel);
				},

				/**
				 * Выполняет подписки на сообщения, которые понадобятся модулю.
				 */
				subscribeSandboxEvents: function() {
					this.sandbox.subscribe("SetMapsConfig", function(mapData) {
                        this.set("Markers", []);
						if (mapData.normalizeSizeMap) {
							this.normalizeSizeMap();
						} else {
							this.setLocation(mapData);
						}
					}, this, [this.sandbox.id]);
				},

				/**
				 * Генерирует представление модуля карт.
				 * @param {Object} renderTo ссылка для отрисовки.
				 * @return {Object} представление.
				 */
				generateView: function(renderTo) {
					var view = {
						renderTo: renderTo,
						id: "osm-maps",
						selectors: {
							wrapEl: "#osm-maps"
						},
						classes: {
							wrapClassName: ["osm-maps-class"]
						},
						items: [
							{
								className: "Terrasoft.Label",
								caption: {bindTo: "HeadMessage"},
								labelClass: "head-label-user-class",
								visible: {bindTo: "IsModalBox"}
							},
							{
								className: "Terrasoft.Button",
								imageConfig: resources.localizableImages.CloseIcon,
								style: Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
								classes: {wrapperClass: "close-btn-user-class"},
								click: {bindTo: "onClickCloseMap"},
								visible: {bindTo: "IsModalBox"}
							},
							{
								className: "Terrasoft.Container",
								id: "maps-container",
								selectors: {wrapEl: "#maps-container"},
								classes: {wrapClassName: ["maps-container-class"]},
								items: []
							}
						]
					};
					return view;
				},

				/**
				 * Генерирует модель представления карт.
				 * @return {Object} модель представления карт.
				 */
				generateViewModel: function() {
					var finallyRender = this.finallyRender;
					var viewModel = {
						values: {
							/**
							 * Описание карты, для отображение в правом нижнем углу карты.
							 * @type {String}.
							 */
							MapAttribution: "Map data &copy; <a href=" + "http://openstreetmap.org" +
									">OpenStreetMap</a>" + " contributors, <a href=" +
									"http://creativecommons.org/licenses/by-sa/2.0/>" + "CC-BY-SA</a>",
							/**
							 * Url тайлов (плиток) карты.
							 * @type {String}.
							 */
							MapTiles: "//{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
							/**
							 * Признак, результата отрисовки модуля.
							 * @type {Boolean}.
							 */
							IsRendered: false,
							/**
							 * Признак, использования модального окна.
							 * @type {Boolean}.
							 */
							IsModalBox: false,
							/**
							 * Массив обьектов с координатами для сохранения в базе.
							 */
							SaveMapsData: null,
							/**
							 * Массив объектов для отображения на карте.
							 * @type {Array}.
							 */
							MapsData: [],
							/**
							 * Массив маркеров для отображения на карте.
							 * @type {Array}.
							 */
							Markers: [],
							/**
							 * Ссылка для отрисовки модуля.
							 * @type {Object}.
							 */
							RenderTo: null,
							/**
							 * Ссылка на обьект Leaflet карты.
							 * @type {Object}.
							 */
							LeafletMap: null,
							/**
							 * Ссылка на обьект Leaflet группы маркеров.
							 * @type {Object}.
							 */
							LeafletGroup: null,
							/**
							 * Величина зума карты по умолчанию.
							 * @type {Number}.
							 */
							ScaleSize: 13,
							/**
							 * Величина сдвига маркера при одинаковых координатах.
							 * @type {Number}.
							 */
							ShiftLength: 0.00003
						},
						methods: {
							Ext: Ext,
							Terrasoft: Terrasoft,
							sandbox: this.sandbox,
							/**
							 * Родительский контекст модуля.
							 */
							parentScope: this,

							/**
							 * Отрисовывает представление модуля карт.
							 * @param viewModel Контекст модели представления карт.
							 */
							finallyRender: finallyRender,

							/**
							 * Обработчик нажатия кнопки закрыть.
							 */
							onClickCloseMap: function() {
								ModalBox.close();
							},

							/**
							 * Устанавливает отображение карты по координатам.
							 * @param {Array} mapData Входные данные для отображения на карте.
							 */
							setLocation: function(mapData) {
								var mapsItems = [];
								if (this.Ext.isEmpty(mapData)) {
									MapsHelper.hideMask();
									this.showInformationDialog(resources.localizableStrings.DataWithoutAddresses);
									return;
								}
								Terrasoft.chain(
										function(next) {
											this.set("MapsData", mapData.mapsData);
											if (this.checkMapsData(mapsItems, mapData)) {
												next();
											}
										},
										function(next) {
											if (!this.Ext.isEmpty(mapsItems)) {
												if (this.get("IsRendered")) {
													MapsHelper.showMask(true);
												}
												this.getCoordinates(mapsItems, function() {
													var marker = this.get("Markers")[0];
													var gpsData = marker[0];
													var geoObject = {
														lat: gpsData.lat,
														lng: gpsData.lon
													};
													this.sendCoordinates(geoObject);
													next();
												});
											} else {
												next();
											}
										},
										function(next) {
											this.finallyRender.call(this.parentScope, this);
											next();
										},
										function(next) {
											if (mapData.useCurrentUserLocation) {
												var locationView = this.getLocationFromMarkers();
												this.renderMap(next, locationView);
											} else {
												this.renderMap(next);
											}
											MapsHelper.hideMask();
											next();
										},
										function() {
											this.saveLocationCoordinates();
										},
										this);
							},

							/**
							 * Проверяет данные для отображения на карте на существование адреса.
							 * Заполняет массив данных с существующими адресами.
							 * @param {Array} mapsItems Данные, которые будут отображены на карте.
							 * @param {Array} mapData Входные данные для отображения на карте.
							 * @return {Boolean} Результат проверки существования адреса.
							 */
							checkMapsData: function(mapsItems, mapData) {
								if (mapData.useDefaultLocation) {
									this.finallyRender.call(this.parentScope, this);
									this.renderMap(null, [0, 0]);
									MapsHelper.hideMask();
									return false;
								}
								Terrasoft.each(mapData.mapsData, function(item) {
									if (!this.Ext.isEmpty(item.address)) {
										if (item.gpsN && item.gpsE) {
											var geoObject = [
												{
													lat: item.gpsN,
													lon: item.gpsE
												}
											];
											geoObject.content = item.content;
											geoObject.useDragMarker = item.useDragMarker;
											this.addMarker(geoObject);
										} else {
											mapsItems.push(item);
										}
									}
								}, this);
								var markers = this.get("Markers") || [];
								if (mapsItems.length === 0 && markers.length === 0) {
									this.showInformationDialog(resources.localizableStrings.DataWithoutAddresses);
									MapsHelper.hideMask();
									return false;
								}
								return true;
							},

							/**
							 * Возвращает координаты первого маркера.
							 * @return {Array} Координаты первого маркера.
							 */
							getLocationFromMarkers: function() {
								var markers = this.get("Markers");
								if (Ext.isEmpty(markers)) {
									return [0, 0];
								}
								var marker = markers[0];
								return [marker[0].lat, marker[0].lon];
							},

							/**
							 * Получает координаты по всем адресам.
							 * @param {Array} items Данные для отображения на карте.
							 * @param {Function} callback Функция пост обработки.
							 */
							getCoordinates: function(items, callback) {
								var item = items[0];
								this.getGeoObject(item, item.address, function(geoObjects) {
									geoObjects.content = item.content;
									geoObjects.useDragMarker = item.useDragMarker;
									this.addMarker(geoObjects);
									items.splice(0, 1);
									if (items.length) {
										this.getCoordinates(items, callback);
									} else {
										callback.call(this);
									}
								});
							},

							/**
							 * Добавляет маркер для отображения на карте.
							 * @param {Array} geoObjects Данные об объекте в geo формате.
							 */
							addMarker: function(geoObjects) {
								var markers = this.get("Markers");
								if (!this.Ext.isArray(markers)) {
									markers = [];
								}
								if (geoObjects) {
									markers.push(geoObjects);
								}
								this.set("Markers", markers);
							},

							/**
							 * Получает массив маркеров типа L.marker.
							 * @return {Array} Массив маркеров.
							 */
							getLeafletMarkersArray: function() {
								var icon = this.getMarkerIcon();
								var markerArray = [];
								this.get("Markers").forEach(function(item) {
									var geoObject = item[0];
									var marker = L.marker([geoObject.lat, geoObject.lon], {
										icon: icon,
										draggable: item.useDragMarker
									});
                                    if (item.content) {
                                        marker.bindPopup(item.content);
                                    }
									marker.on("dragend", this.processDragEndMarker, this);
									markerArray.push(marker);
								}, this);
								return markerArray;
							},

							/**
							 * Устанавливает видимую область карты относительно группы маркеров.
							 * @param {Object} map Объект карты.
							 * @param {Object} group Объект группы маркеров.
							 */
							fitBoundsMap: function(map, group) {
								map.fitBounds(group.getBounds(), {
									paddingTopLeft: [50, 50],
									paddingBottomRight: [20, 0]
								});
							},

							/**
							 * Перерисовывает карту относительно новых размеров контейнера.
							 */
							normalizeSizeMap: function() {
								var map = this.get("LeafletMap");
								var group = this.get("LeafletGroup");
								map.invalidateSize({reset: true});
								if (!this.Ext.isEmpty(group) && !this.Ext.isEmpty(group.getLayers())) {
									this.fitBoundsMap(map, group);
								}
							},

							/**
							 * Отрисовка карты.
							 * @param {Function} callback Функция пост обработки.
							 * @param {Array} locationView Координаты.
							 */
							renderMap: function(callback, locationView) {
								var map = this.get("LeafletMap");
								var group = this.get("LeafletGroup");
								if (this.Ext.isEmpty(map)) {
									map = L.map("maps-container");
									L.tileLayer(this.get("MapTiles"), {
										attribution: this.get("MapAttribution")
									}).addTo(map);
									map.on("resize", this.normalizeSizeMap, this);
								}
								if (!this.Ext.isEmpty(locationView)) {
									map.setView(locationView, this.get("ScaleSize"));
									this.set("LeafletMap", map);
									this.set("Markers", []);
									if (!this.Ext.isEmpty(group)) {
										group.clearLayers();
									}
									return;
								}
								var markerArray = this.getLeafletMarkersArray();
								markerArray = this.reorderSimilarMarker(markerArray, this.get("ShiftLength"));
								if (!this.Ext.isEmpty(group)) {
									group.clearLayers();
									group.addLayer(L.featureGroup(markerArray));
								} else {
									var featureGroup = new L.featureGroup(markerArray);
									group = featureGroup.addTo(map);
								}
								this.fitBoundsMap(map, group);
								this.setHeaderCaption();
								this.set("LeafletGroup", group);
								this.set("LeafletMap", map);
								this.set("Markers", []);
								if (this.get("IsModalBox")) {
									ModalBox.updateSizeByContent();
								}
								if (this.Ext.isFunction(callback)) {
									callback.call(this);
								}
							},

							/**
							 * Размещает маркеры с одинаковыми координатами в линию по диагонали.
							 * @param {Array} inputMarkers Входной массив маркеров.
							 * @param {number} step Смещение похожих маркеров.
							 * @return {Array} Откорректированный массив маркеров.
							 */
							reorderSimilarMarker: function(inputMarkers, step) {
								var outputMarkers = [];
								inputMarkers.forEach(function(item) {
									var geoObject = item._latlng;
									var lat = geoObject.lat;
									var lng = geoObject.lng;
									item.delta = 0;
									outputMarkers.forEach(function(outItem) {
										if ((outItem._latlng.lat === lat) && (outItem._latlng.lng === lng)) {
											item.delta = outItem.delta + step;
										}
									});
									outputMarkers.push(item);
								});
								outputMarkers.forEach(function(item) {
									var delta = item.delta;
									var latLng = item._latlng;
									latLng.lat += delta;
									latLng.lng += delta;
								});
								return outputMarkers;
							},

							/**
							 * Возвращает параметры иконки маркера.
							 * @return {Object} Параметры иконки маркера.
							 */
							getMarkerIcon: function() {
								var iconUrl = Terrasoft.ImageUrlBuilder.getUrl(
										resources.localizableImages.MarkerIcon);
								var shadowUrl = Terrasoft.ImageUrlBuilder.getUrl(
										resources.localizableImages.MarkerShadow);
								return L.icon({
									iconUrl: iconUrl,
									shadowUrl: shadowUrl,
									iconSize: [25, 41],
									shadowSize: [41, 41],
									iconAnchor: [11, 41],
									shadowAnchor: [12, 41],
									popupAnchor: [1, -32]
								});
							},

							/**
							 * Устанавливает заголовок модального окна.
							 */
							setHeaderCaption: function() {
								var mapsData = this.get("MapsData");
								var markers = this.get("Markers");
								var addressCount = mapsData.length;
								var foundedAddressCount = markers.length;
								if (addressCount === foundedAddressCount) {
									this.set("HeadMessage", resources.localizableStrings.AddressesFoundFull);
								} else {
									var message = this.Ext.String.format(resources.localizableStrings.AddressesFoundPartially,
											foundedAddressCount, addressCount);
									this.set("HeadMessage", message);
								}
							},

							/**
							 * Обработчик завершения перетаскивания маркера.
							 * @param {Object} marker Информация о маркере.
							 */
							processDragEndMarker: function(marker) {
								var map = this.get("LeafletMap");
								var group = this.get("LeafletGroup");
								this.fitBoundsMap(map, group);
								var latLng = marker.target.getLatLng();
								this.sendCoordinates(latLng);
							},

							/**
							 * Отправка координат в карточку.
							 * @param {Array} latLng Координаты.
							 */
							sendCoordinates: function(latLng) {
								if (this.Ext.isEmpty(latLng)) {
									return;
								}
								this.sandbox.publish("GetCoordinates", latLng, [this.sandbox.id]);
							},

							/**
							 * Получает координаты по заданному адресу используя сервис Nominatim.
							 * @param {Object} mapDataItem Текущий елемент для карты.
							 * @param {Array|String} address Адрес.
							 * @param {Function} callback Функция пост обработки.
							 */
							getGeoObject: function(mapDataItem, address, callback) {
								if (MapsHelper.getIsEmptyAddress(address)) {
									MapsHelper.hideMask();
									this.showInformationDialog(resources.localizableStrings.AddressesNotFound);
								} else {
									var options = this.getNominatimRequestOptions(mapDataItem, address, callback);
									this.Ext.data.JsonP.request(options);
								}
							},

							/**
							 * Обрабатывает ответ от гео сервиса Nominatim.
							 * @param {Object} response Ответ запроса.
							 * @param {Object} mapDataItem Текущий елемент для карты.
							 * @param {Array|String} address Адрес.
							 * @param {Function} callback Функция пост обработки.
							 */
							processNominatimResponse: function(response, mapDataItem, address, callback) {
								if (!this.Ext.isEmpty(response)) {
									if (mapDataItem.updateCoordinatesConfig) {
										this.addSaveMapsData(mapDataItem, response[0]);
									}
									callback.call(this, response);
								} else {
									var newAddress = this.addressPop(address);
									this.getGeoObject(mapDataItem, newAddress, callback);
								}
							},

							/**
							 * Удаляет последний элемент из адреса.
							 * @param {Array|String} address Адрес.
							 * @return {Array} Адрес.
							 */
							addressPop: function(address) {
								if (!this.Ext.isArray(address)) {
									address = address.split(", ");
								}
								address.pop();
								return address;
							},

							/**
							 * Возвращает опции для построения запроса к сервису Nominatim.
							 * @param {Object} mapDataItem Текущий елемент для карты.
							 * @param {Array|String} address Адрес.
							 * @param {Function} callback Функция пост обработки.
							 * @return {Object} Опции запроса к сервису Nominatim.
							 */
							getNominatimRequestOptions: function(mapDataItem, address, callback) {
								var callbackName = "nominatimCallback";
								var me = this;
								this.Ext.data.JsonP[callbackName] = function(response) {
									me.processNominatimResponse(response, mapDataItem, address, callback);
								};
								var url = this.getNominatimRequestUrl(callbackName);
								var params = {
									format: "json"
								};
								if (this.Ext.isArray(address)) {
									if (address[0]) {
										params.country = address[0];
									}
									if (address[1]) {
										params.state = address[1];
									}
									if (address[2]) {
										params.city = address[2];
									}
									if (address[3]) {
										params.street = address[3];
									}
								} else {
									params.q = address;
								}
								return {
									url: url,
									params: params
								};
							},

							/**
							 * Возвращает Url для построения запроса к сервису Nominatim.
							 * @param {String} callbackName Имя callback функции.
							 * @param {String} engine (optional) Название сервиса геокодирования.
							 * @return {String} Url запроса к сервису Nominatim.
							 */
							getNominatimRequestUrl: function(callbackName, engine) {
								var params = !this.Ext.isEmpty(callbackName) ?
									"?json_callback=Ext.data.JsonP." + callbackName : "";
								var url = "";
								if (this.Ext.isEmpty(engine) || engine === "osm" || engine === "openstreetmap") {
									url = "//nominatim.openstreetmap.org/search" + params;
								} else if (engine === "mapquest") {
									url = "//open.mapquestapi.com/nominatim/v1/search.php" + params;
								} else {
									throw new Terrasoft.UnsupportedTypeException({
										message: "Unsupported Geocoding engine"
									});
								}
								return url;
							},

							/**
							 * Добавляет в массив обьектов с координатами для сохранения в базе.
							 * @param {Object} mapDataItem объект для кеширования.
							 * @param {Object} geoObject объект с координатами
							 */
							addSaveMapsData: function(mapDataItem, geoObject) {
								if (mapDataItem.gpsN === geoObject.lat && mapDataItem.gpsE === geoObject.lon) {
									return;
								}
								var saveMapsData = this.get("SaveMapsData");
								var saveMapItem = {
									id: mapDataItem.updateCoordinatesConfig.id,
									schemaName: mapDataItem.updateCoordinatesConfig.schemaName,
									gpsN: geoObject.lat,
									gpsE: geoObject.lon
								};
								if (!Ext.isArray(saveMapsData)) {
									saveMapsData = [];
								}
								saveMapsData.push(saveMapItem);
								this.set("SaveMapsData", saveMapsData);
							},

							/**
							 * Сохраняет координаты в базе.
							 */
							saveLocationCoordinates: function() {
								var items = this.get("SaveMapsData");
								if (Ext.isEmpty(items)) {
									return;
								}
								var requestUrl = Terrasoft.workspaceBaseUrl + "/rest/MapsService/CacheCoordinates";
								Terrasoft.AjaxProvider.request({
									url: requestUrl,
									headers: {
										"Accept": "application/json",
										"Content-Type": "application/json"
									},
									method: "POST",
									jsonData: {
										itemsJSON: Ext.JSON.encode(items)
									},
									callback: function(request, success) {
										if (success) {
											this.set("SaveMapsData", []);
										}
									},
									scope: this
								});
							}
						}
					};
					return viewModel;
				},

				/**
				 * Отрисовывает представление модуля карт.
				 * @param {Object} viewModel Контекст модели представления карт.
				 */
				finallyRender: function(viewModel) {
					if (viewModel.get("IsRendered")) {
						return;
					}
					var renderTo = viewModel.get("RenderTo");
					if (viewModel.get("IsModalBox")) {
						var boxSize = {
							minWidth: 20,
							maxWidth: 90,
							minHeight: 20,
							maxHeight: 90
						};
						renderTo = ModalBox.show(boxSize);
					}
					var view = this.Ext.create("Terrasoft.Container", this.generateView(renderTo));
					view.bind(viewModel);
					this.sandbox.publish("AfterRenderMap", null, [this.sandbox.id]);
					viewModel.set("IsRendered", true);
				}
			});
			return Terrasoft.OsmMapsModule;
		});
