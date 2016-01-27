define("IntroPage", ["performancecountermanager", "BaseSchemaModuleV2"],
	function(performanceManager) {
		/**
		 * @class Terrasoft.configuration.IntroPage
		 * Класс модуля главной страницы.
		 */
		Ext.define("Terrasoft.configuration.IntroPage", {
			alternateClassName: "Terrasoft.IntroPage",
			extend: "Terrasoft.BaseSchemaModule",

			/**
			 * Подписывается на сообщения для инициации параметров шапки приложения.
			 * @overridden
			 */
			init: function() {
				performanceManager.start(this.sandbox.id + "_Init");
				var headerConfig = {
					isMainMenu: true,
					isCaptionVisible: false,
					isContextHelpVisible: true
				};
				this.sandbox.publish("InitDataViews", headerConfig);
				this.sandbox.subscribe("NeedHeaderCaption", function() {
					this.sandbox.publish("InitDataViews", headerConfig);
				}, this);
				this.callParent(arguments);
				performanceManager.stop(this.sandbox.id + "_Init");
			},

			render: function(renderTo) {
				performanceManager.start(this.sandbox.id + "_Render");
				this.callParent(arguments);
				this.sandbox.publish("InitContextHelp", "0");
				performanceManager.stop(this.sandbox.id + "_Render");
			}
		});
		return Terrasoft.IntroPage;
	});
