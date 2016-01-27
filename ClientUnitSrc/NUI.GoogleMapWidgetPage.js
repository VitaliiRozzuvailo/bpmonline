define('gmaps', ['async!http://maps.google.com/maps/api/js?v=3&sensor=false'], function() {
	return window.google;
});

define('GoogleMapWidgetPage', ['ext-base', 'terrasoft', 'sandbox', 'gmaps', 'GoogleMapWidgetPageResources'],
function(Ext, Terrasoft, sandbox, google, resources) {
	function showMap() {
		var mapOptions = {
			center: new google.maps.LatLng(50.4501, 30.5234), // координаты Киева
			zoom: 3,
			mapTypeId: google.maps.MapTypeId.ROADMAP
		};
		var map = new google.maps.Map(Ext.getBody().dom, mapOptions);
		return map;
	}
	
	function setMarker(map, objectAddress, objectName) {
		var geocoder = new google.maps.Geocoder();
		geocoder.geocode({ 'address': objectAddress}, function(results, status) {
			if (status == google.maps.GeocoderStatus.OK) {
				var latitude = results[0].geometry.location;
				map.setCenter(latitude);
				map.setZoom(18);
				var marker = new google.maps.Marker({
					map: map,
					position: latitude
				});
				var infoWindowContent = '<div><b><u>' + objectName + '</u></b></br><div>' + objectAddress + '</div></div>';
				var infoWindow = new google.maps.InfoWindow({content: infoWindowContent});
				infoWindow.open(map, marker);
				google.maps.event.addListener(marker, 'click', function() {
						infoWindow.open(map, marker);
					});
			} else {
				showGeocodingResultMessage(status);
			}
		});
	}
	
	function showGeocodingResultMessage(status) {
		var message;
		if (status == google.maps.GeocoderStatus.ZERO_RESULTS) {
			message = resources.localizableStrings.UnknownAddressErrorCause;
		} else if (status == google.maps.GeocoderStatus.OVER_QUERY_LIMIT) {
			message = resources.localizableStrings.TooManyQueriesErrorCause;
		} else if (status == google.maps.GeocoderStatus.REQUEST_DENIED) {
			message = resources.localizableStrings.ServerErrorErrorCause;
		} else if (status == google.maps.GeocoderStatus.INVALID_REQUEST) {
			message = resources.localizableStrings.MissingQueryErrorCause;
		} else {
			message = resources.localizableStrings.GeneralErrorCause;
		}
		Terrasoft.utils.showInformation(message, null, null, {buttons: ['ok']});
	}
	
	function fetchParameter(input, regx, parameterName) {
		var match = regx.exec(input);
		if (match.length == 1) {
			return match[0].replace(parameterName + '=', '');
		} else {
			return undefined;
		}
	}
	
	function render(renderTo) {
		var objectAddress, objectName;
		var historyState = sandbox.publish('GetHistoryState');
		if (historyState.hash.entityName) {
			var state = decodeURIComponent(historyState.hash.entityName);
			objectAddress = fetchParameter(state, /address=[^&]*/, 'address');
			objectName = fetchParameter(state, /name=.*/, 'name');
		}
		var googleMap = showMap();
		if (objectAddress && objectName) {
			setMarker(googleMap, objectAddress, objectName);
		}
	}

	return {
		render: render
	};
});