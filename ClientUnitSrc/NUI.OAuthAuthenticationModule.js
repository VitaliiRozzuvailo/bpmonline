define('OAuthAuthenticationModule', ['ext-base', 'terrasoft', 'sandbox', 'OAuthAuthenticationModuleResources'],
    function (Ext, Terrasoft, sandbox, resources) {

        function init() {
            var params = Ext.Object.fromQueryString(window.location.hash.substr(window.location.hash.indexOf('?')));
            var socialNetworkName = params.socialNetworkName;
            getOAuthTokens(socialNetworkName);
        }

        function getOAuthTokens(socialNetworkName) {
            var dataSend = {
                socialNetworkName: socialNetworkName
            };
            var ajaxProvider = Ext.Ajax;
            callServiceMethod(ajaxProvider, 'GetOAuthTokens', function(response) { }, dataSend);
        }

        function callServiceMethod(ajaxProvider, methodName, callback, dataSend) {
            var provider = ajaxProvider;
            var data = dataSend || {};
            var requestUrl = '../rest/SocialNetworksUtilitiesService/' + methodName;
            provider.request({
                url: requestUrl,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                method: 'POST',
                jsonData: data,
                success: function(response, opts){
				  window.location = response.getResponseHeader('location');
                },
                failure: function(response, opts) {
                },
            scope: this
        });
    }

return {
    init: init
};
});
