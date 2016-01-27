define('MapsModule', ['MapsModuleResources', 'ModalBox', 'ConfigurationEnums', 'MaskHelper'],
		function(resources, modalbox, ConfigurationEnums, MaskHelper) {

			var Ext;
			var sandbox;
			var Terrasoft;
			var viewConfig;
			var viewModel;
			var map = null;
			var isApiLoad = false;
			var mapsConfig = null;
			var infowindow = null;
			var directionsDisplay = null;
			var directionsService = null;
			var google = null;

			function createConstructor(context) {
				Ext = context.Ext;
				sandbox = context.sandbox;
				Terrasoft = context.Terrasoft;

				return Ext.define('MapsModule', {
					init: init
				});
			}

			window.initializeGoogleMaps = function() {
				infowindow = new google.maps.InfoWindow({
					size: new google.maps.Size(150, 100)
				});
				directionsDisplay = new google.maps.DirectionsRenderer();
				directionsService = new google.maps.DirectionsService();
				mapsConfig = getMapsConfig();
				mapsConfig.geocodingDone = geocodingFinished;
				if (!mapsConfig.isAddressesExists()) {
					MaskHelper.HideBodyMask();
					Terrasoft.utils.showInformation(resources.localizableStrings.DataWithoutAddresses, null, null,
							{buttons: ['ok']});
				} else {
					Terrasoft.each(mapsConfig.mapsData, function(item) {
						if (item.gpsN && item.gpsE) {
							var location = new google.maps.LatLng(item.gpsN, item.gpsE);
							mapsConfig.addLocation(item, location);
						}
						else if (item.address) {
							var geocoder = new google.maps.Geocoder();
							geocoder.geocode({'address': item.address}, function(results, status) {
								if (status === google.maps.GeocoderStatus.OK) {
									mapsConfig.addLocation(item, results[0].geometry.location, true);
								} else {
									mapsConfig.addLocation(item, null);
								}
							});
						} else {
							mapsConfig.addLocation(item, null);
						}
					});
				}
			};

			function geocodingFinished(mapsConfig) {
				var validation = mapsConfig.isValid();
				if (validation.status) {
					innerRender();
					var mapDiv = document.getElementById('map-canvas');
					map = new google.maps.Map(mapDiv, {
							mapTypeId: google.maps.MapTypeId.ROADMAP
						}
					);
					directionsDisplay.setMap(map);
					var latlngbounds = getZoom();
					map.fitBounds(latlngbounds);
					google.maps.event.addListenerOnce(map, 'bounds_changed', function() {
						if (mapsConfig.countGeocoded() === 1 || map.getZoom() > 17) {
							map.setZoom(17);
						}
					});
					google.maps.event.addListenerOnce(map, 'idle', drawObjectsOnMaps);
					google.maps.event.addListener(map, 'click', function() {
						infowindow.close();
					});
					modalbox.updateSizeByContent();
				} else {
					Terrasoft.utils.showInformation(validation.message, null, null,
							{buttons: ['ok']});
				}
			}

			function init() {
				if (!isApiLoad) {
					var apiKey = Terrasoft.SysSettings.cachedSettings.GoogleMapsApiKey;
					var apiString = !apiKey ? '' : '&key=' + apiKey;
					require(['https://maps.googleapis.com/maps/api/js?v=3.exp' + apiString +
							'&sensor=true&callback=initializeGoogleMaps'],
							function() {
								google = window.google;
								isApiLoad = true;
							});
				} else {
					window.initializeGoogleMaps();
				}
			}

			function innerRender() {
				MaskHelper.HideBodyMask();
				var renderTo = modalbox.show({minWidth: 20, maxWidth: 90, minHeight: 20, maxHeight: 90});
				viewModel = getViewModel();
				viewConfig = getView(renderTo);
				viewConfig.bind(viewModel);

			}

			function getViewModel() {
				return Ext.create("Terrasoft.BaseViewModel", {
					values: {
						headMessage: ''
					},
					methods: {
						onClickCloseMaps: function() {
							modalbox.close();
						}
					}
				});
			}

			function getView(renderTo) {
				var labelConfig = Ext.create('Terrasoft.Label', {
					caption: {bindTo: 'headMessage'},
					labelClass: 'head-label-user-class'
				});
				var buttonsConfig = Ext.create('Terrasoft.Button', {
					imageConfig: resources.localizableImages.CloseIcon,
					style: Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
					classes: {wrapperClass: 'close-btn-user-class'},
					selectors: {
						wrapEl: '#googlemap'
					},
					click: {bindTo: 'onClickCloseMaps'}
				});
				var viewHeight = Ext.Element.getViewportHeight();
				var viewWidth = Ext.Element.getViewportWidth();
				var html = Ext.String.format('<div id="map-canvas" style="width: {0}px; height: {1}px"></div>',
						viewWidth * 0.80, viewHeight * 0.70);
				var mapsConfig = Ext.create('Terrasoft.HtmlControl', {
					id: 'googlemap',
					className: 'Terrasoft.HtmlControl',
					html: html,
					selectors: {
						wrapEl: '#googlemap'
					},
					onAfterRender: function() {
					}
				});
				var resultConfig = Ext.create('Terrasoft.Container', {
					id: 'mapsContainer',
					selectors: {
						wrapEl: '#mapsContainer'
					},
					renderTo: renderTo,
					items: [
						labelConfig,
						buttonsConfig,
						mapsConfig
					]
				});
				return resultConfig;
			}

			function getMapsConfig() {
				var moduleId = sandbox.id;
				mapsConfig = {
					mapsData: [],
					mapsModuleMode: ConfigurationEnums.MapsModuleMode.Points,
					mapsLetterMarker: false
				};
				Ext.apply(mapsConfig, sandbox.publish('GetMapsConfig', moduleId, [moduleId]));

				mapsConfig.isGeocodingFinished = function() {
					var arrayLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O',
						'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
					var count = 0;
					var isFinished = true;
					Terrasoft.each(this.mapsData, function(item) {
						if (item.location === undefined) {
							isFinished = false;
							return;
						}
					});
					if (isFinished) {
						this.saveLocationCoordinates();
						var that = this;
						// push message to save geodata
						Terrasoft.each(this.mapsData, function(item) {
							if (item.location) {
								item.letter = count < arrayLetters.length ? arrayLetters[count] :
										arrayLetters[arrayLetters.length - 1];
								count++;
								var thatLocation = item.location;
								var dublicates = that.mapsData.filter(function(item) {
									return thatLocation.equals(item.location);
								});
								var shift = Math.floor(dublicates.length / 2);
								Terrasoft.each(dublicates, function(item, index) {
									item.location = new google.maps.LatLng(thatLocation.lat(), thatLocation.lng() +
											((index - shift) * 0.00005));
								});
							} else {
								item.letter = '';
							}
						});
						this.geocodingDone(this);
					}
				};

				mapsConfig.isAddressesExists = function() {
					var isMapsDataValid = false;
					Terrasoft.each(mapsConfig.mapsData, function(value) {
						if (value.address) {
							isMapsDataValid = true;
							return false;
						}
					});
					return isMapsDataValid;
				};

				mapsConfig.countGeocoded = function() {
					var count = 0;
					Terrasoft.each(this.mapsData, function(item) {
						if (item.location) {
							count++;
						}
					});
					return count;
				};

				mapsConfig.addLocation = function(item, location, updateCoordinates) {
					item.location = location;
					if (location && updateCoordinates) {
						item.updateCoordinates = updateCoordinates;
					}
					this.isGeocodingFinished();
				};

				mapsConfig.isValid = function() {
					var result = {status: true, message: ''};
					switch (this.mapsModuleMode) {
						case ConfigurationEnums.MapsModuleMode.Points:
							if (!this.isAddressesExists()) {
								result.status = false;
								result.message = resources.localizableStrings.AddressesNotFound;
							}
							break;
						case ConfigurationEnums.MapsModuleMode.Route:
							if ((this.mapsData.length < 2) ||
									!(this.mapsData[0].location && this.mapsData[1].location)) {
								result.status = false;
								result.message = resources.localizableStrings.AddressesNotFound;
							}
							break;
						case ConfigurationEnums.MapsModuleMode.RouteGeolocation:
							if ((this.mapsData.length === 0) || !this.mapsData[0].location) {
								result.status = false;
								result.message = resources.localizableStrings.AddressesNotFound;
							}
							if (!navigator.geolocation) {
								result.status = false;
								result.message = resources.localizableStrings.BrowserRejectGeolocation;
							}
							break;
					}
					return result;
				};

				mapsConfig.saveLocationCoordinates = function() {
					var data = this.mapsData;
					var items = [];
					for (var i = 0; i < data.length; i++) {
						if (data[i].updateCoordinatesConfig && data[i].location && data[i].updateCoordinates === true) {
							var item = {
								id: data[i].updateCoordinatesConfig.id,
								schemaName: data[i].updateCoordinatesConfig.schemaName,
								gpsN: data[i].location.lat(),
								gpsE: data[i].location.lng()
							};
							items.push(item);
						}
					}
					var scope = this;
					var requestUrl = Terrasoft.workspaceBaseUrl + '/rest/MapsService/CacheCoordinates';
					Terrasoft.AjaxProvider.request({
						url: requestUrl,
						headers: {
							'Accept': 'application/json',
							'Content-Type': 'application/json'
						},
						method: 'POST',
						jsonData: {
							itemsJSON: Ext.JSON.encode(items)
						},
						callback: function() {
						},
						scope: scope
					});
				};

				return mapsConfig;
			}

			function drawObjectsOnMaps() {
				switch (mapsConfig.mapsModuleMode) {
					case ConfigurationEnums.MapsModuleMode.Points:
						addMarkersByAddresses(mapsConfig.mapsData);
						break;
					case ConfigurationEnums.MapsModuleMode.Route:
						addRouteByAddresses(mapsConfig.mapsData);
						break;
					case ConfigurationEnums.MapsModuleMode.RouteGeolocation:
						addRouteWithDetectLocation(mapsConfig.mapsData);
				}
			}

			function addMarkersByAddresses(mapsData) {
				var found = null;
				if (mapsConfig.mapsData.length === mapsConfig.countGeocoded()) {
					found = resources.localizableStrings.AddressesFoundFull;
				} else {
					found = Ext.String.format(resources.localizableStrings.AddressesFoundPartially,
							mapsConfig.countGeocoded(), mapsConfig.mapsData.length);
				}
				setHeadMessage(found);
				Terrasoft.each(mapsData, function(item) {
					if (item.location) {
						var marker = new google.maps.Marker({
							position: item.location,
							map: map,
							icon: null,
							title: (item.caption || ''),
							customContent: (item.content || '')
						});
						if (mapsConfig.mapsLetterMarker) {
							marker.icon = 'https://chart.googleapis.com/chart?chst=d_map_pin_letter&chld=' +
								item.letter + '|FF7C71|000000';
						}
						if (item.content) {
							google.maps.event.addListener(marker, 'click', function() {
								infowindow.setContent(item.content);
								infowindow.open(map, marker);
							});
						}
					}
				});
			}

			function addRouteByAddresses(mapsData) {
				var mode = 'DRIVING';
				var request = {
					origin: mapsData[0].location,
					destination: mapsData[1].location,
					travelMode: google.maps.TravelMode[mode]
				};
				directionsService.route(request, function(response, status) {
					if (status === google.maps.DirectionsStatus.OK) {
						directionsDisplay.setDirections(response);
						setHeadMessage(resources.localizableStrings.RouteFound);
					} else {
						setHeadMessage(resources.localizableStrings.RouteNotFound);
					}
				});
			}

			function addRouteWithDetectLocation(mapsData) {
				navigator.geolocation.getCurrentPosition(
						function(position) {
							var pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
							var array = [
								{location: pos},
								{location: mapsData[0].location}
							];
							addRouteByAddresses(array);
						},
						function() {
							setHeadMessage(resources.localizableStrings.GeolocationServiceFailed);
						}
				);
			}

			function getZoom() {
				var latlngbounds = new google.maps.LatLngBounds();
				for (var i = 0; i < mapsConfig.mapsData.length; i++) {
					if (mapsConfig.mapsData[i].location) {
						latlngbounds.extend(mapsConfig.mapsData[i].location);
					}
				}
				return latlngbounds;
			}

			function setHeadMessage(text) {
				viewModel.set('headMessage', text);
				modalbox.updateSizeByContent();
			}

			return createConstructor;
		});