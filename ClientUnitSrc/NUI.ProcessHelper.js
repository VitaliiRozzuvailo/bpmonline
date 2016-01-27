define('ProcessHelper', ['ext-base', 'terrasoft', 'ProcessHelperResources'],
	function(Ext, Terrasoft, resources) {


	function cardOnLoadEntryPoint(response) {
		var buttonRenderTo = Ext.get('utils-left');
		if (!Ext.isArray(response) || response.length === 0 || Ext.isEmpty(buttonRenderTo)) {
			return;
		}
		var buttonConfig = {
			style: Terrasoft.controls.ButtonEnums.style.DEFAULT,
			caption: resources.localizableStrings.ContinueByProcessCaption,
			renderTo: buttonRenderTo
		}
		if (response.length > 1) {
			var buttonItems = [];
			Terrasoft.each(response, function(item) {
				buttonItems.push({
					caption: item.caption,
					tag: item.id,
					click: {
						bindTo: 'onEntryPointSelectFromItems'
					}
				});
			}, this);
			buttonConfig.menu = { items: buttonItems };
		} else {
			buttonConfig.tag = response[0].id;
			buttonConfig.click = {
				bindTo: 'onEntryPointSelectFromSingle'
			}
		}

		var entryPointsButton = Ext.create('Terrasoft.Button', buttonConfig);
		entryPointsButton.bind(this);
	}

	function onEntryPointSelectFromSingle(event, caller, fn, tag) {
		moveThroughEntryPoint.call(this, tag);
	}

	function onEntryPointSelectFromItems(tag) {
		moveThroughEntryPoint.call(this, tag);
	}

	function moveThroughEntryPoint(tag) {
		var sandbox = this.getSandbox();
		var id = this.get(this.entitySchema.primaryColumnName);
		var callback = function(args) {
			console.log(Ext.String.format('Process {0} Error', args.id));
		}
		processElementChanged(tag, id, sandbox, callback, this);
	}

	function prepareCard() {
		var processListeners = this.get('ProcessListeners');
		if (Ext.isEmpty(processListeners) || processListeners <= 0) {
			return;
		}
		var sandbox = this.getSandbox();
		if (Ext.isEmpty(this.entitySchema)) {
			return;
		}
		var entitySchema = this.entitySchema;
		var entitySchemaUId = entitySchema.uId;
		var id = this.get(entitySchema.primaryColumnName);
		if (!Terrasoft.isGUID(id)) {
			return;
		}

		this.onEntryPointSelectFromSingle = onEntryPointSelectFromSingle;
		this.onEntryPointSelectFromItems = onEntryPointSelectFromItems;

		sandbox.publish('GetProcessEntryPointsData', {
			entitySchemaUId: entitySchemaUId,
			recordId: id,
			callback: cardOnLoadEntryPoint,
			scope: this
		});
	}

	function processElementChanged(procElUId, recordId, sandbox, errorCallback, scope) {
		sandbox.publish('ProcessExecDataChanged', {
			procElUId: procElUId,
			recordId: recordId,
			scope: this,
			parentMethodArguments: { id: procElUId },
			parentMethod: errorCallback
		});
	}

	function getProcessElementData(sandbox) {
		return sandbox.publish('GetProcessExecData')
	}
	function getIsDateTimeDataValueType(dataValueType) {
		return (dataValueType && (dataValueType === Terrasoft.DataValueType.DATE
			|| dataValueType === Terrasoft.DataValueType.DATE_TIME
			|| dataValueType === Terrasoft.DataValueType.TIME));
	}

	function getClientValueByDataValueType(value, dataValueType) {
		try {
			if (getIsDateTimeDataValueType(dataValueType)) {
				return Terrasoft.parseDate(value);
			}
		} catch (e) {

		}
		return value;
	}

	function getServerValueByDataValueType(value, dataValueType) {
		try {
			if (getIsDateTimeDataValueType(dataValueType)) {
				return Terrasoft.encodeDate(value);
			}
		} catch (e) {
		}
		return value;
	}

	return {
		getClientValueByDataValueType: getClientValueByDataValueType,
		getServerValueByDataValueType: getServerValueByDataValueType,
		getProcessElementData: getProcessElementData,
		processElementChanged: processElementChanged,
		getIsDateTimeDataValueType: getIsDateTimeDataValueType,
		prepareCard: function(viewModel) {
			prepareCard.call(viewModel)
		}
	};
});