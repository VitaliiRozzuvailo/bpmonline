define("BaseCommunicationDetail", ["BaseCommunicationDetailResources", "CtiConstants",
		"CTIBaseCommunicationViewModel"],
	function(resources, CtiConstants) {
		return {
			messages: {
				"CallCustomer": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.PUBLISH
				},
				"DoNotUseCommunication": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.PUBLISH
				}
			},
			methods: {

				/**
				 * Инцициализация детали.
				 * @inheritdoc Terrasoft.BaseCommunicationDetail#init
				 * @overridden
				 */
				init: function() {
					this.set("BaseCommunicationViewModelClassName", "Terrasoft.CTIBaseCommunicationViewModel");
					this.callParent(arguments);
				}
			}
		};
	});