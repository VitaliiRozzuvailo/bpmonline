define("GeneratedWebFormUtilities", ["ext-base", "terrasoft", "GeneratedWebFormUtilitiesResources", "RightUtilities"],
	function(Ext, Terrasoft, resources, RightUtilities) {
		var eoln = "\r\n";
		var webToLeadFormName = "webToLeadForm";
		var fieldsCaptionsArrayString = "";

		function checkManageWebForms(scope, callback) {
			RightUtilities.checkCanExecuteOperation({
				operation: "CanManageWebForms"
			}, function(result) {
				scope.set("canManageWebForms", result);
				if (callback) {
					callback.call();
				}
			}, scope);
		}

		function initCanManageWebForms(scope, callback) {
			scope.set("canManageWebForms", false);
			checkManageWebForms(scope, callback);
		}

		function openLeadEditPageDesigner(scope, recordId, action) {
			var moduleId = "ViewModule_CardModule_GeneratedWebForm_WebColumnModule_" + action;
			var sandbox = scope.sandbox || scope.getSandbox();
			var params = sandbox.publish("GetHistoryState");
			sandbox.publish("PushHistoryState", {hash: params.hash.historyState,
				stateObj: {
					schemaName: "GeneratedWebFormLeadColumns",
					cardSandBoxId: sandbox.id,
					recordId: recordId,
					columns: "GeneratedWebFormLeadColumns",
					action: action
				}
			});
			sandbox.loadModule("LeadEditPageDesigner", {
				renderTo: scope.renderTo || Ext.get("centerPanel"),
				keepAlive: true,
				id: moduleId
			});
		}

		function saveFormCodeToFile(scope, recordId) {
			fieldsCaptionsArrayString = "var fieldsCaptionsArray = [";
			if (!recordId) {
				return;
			}
			var formName = "";
			var select = Ext.create("Terrasoft.EntitySchemaQuery", {
					rootSchemaName: "GeneratedWebForm",
					rowCount: 1
				}
			);
			select.addColumn("Id");
			select.addColumn("Name");
			select.addColumn("FormFields");
			select.filters.add("Id",
				select.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL, "Id", recordId));
			select.getEntityCollection(function(response) {
				var entityCollection = response.collection;
				if (entityCollection.getCount() === 0) {
					return;
				}
				var entityItem = entityCollection.getItems()[0];
				var formFields = entityItem.get("FormFields");
				scope.set("DesignFormFieldsToSaveCode", false);
				if (!formFields || (formFields === "")) {
					scope.showConfirmationDialog(resources.localizableStrings.ConfigureFormFields,
						function(result) {
							if (result === Terrasoft.MessageBoxButtons.YES.returnCode) {
								scope.set("DesignFormFieldsToSaveCode", true);
								openLeadEditPageDesigner(scope, recordId, "edit");
							}
						},
						["yes", "no"]);
				} else {
					formName = entityItem.get("Name");
					generateFormCode(scope, recordId, function(formCode) {
						var data = Ext.JSON.encodeString(formCode);
						var ajaxProvider = Terrasoft.AjaxProvider;
						ajaxProvider.request({
							url: "../rest/GeneratedWebFormService/SendFormDataToSave",
							headers: {
								"Accept": "application/json",
								"Content-Type": "application/json"
							},
							method: "POST",
							jsonData:  data,
							callback: function(request, success, response) {
								if (success) {
									var dataToSaveKey = Terrasoft.decode(response.responseText);
									var txtFile = document.createElement("a");
									txtFile.href = "../rest/GeneratedWebFormService/SaveFormDataToFile/" +
										"BPMonline_" + formName + "/" + dataToSaveKey;
									txtFile.download = "BPMonline_" + formName + ".txt";
									document.body.appendChild(txtFile);
									txtFile.click();
									document.body.removeChild(txtFile);
								}
							},
							scope: scope
						});
					});
				}
			});
		}

		function generateInputField(field, caption, isRequired, value) {
			/* jshint quotmark: false */
			var result = "";
			var requiredCode =
				(!isRequired ? '' : '<abbr title="required" font="150%" style="color:#ff0000">*</abbr>');
			result += '<div class="control-group">' + eoln;
			result += '<label class="control-label" for="' + field + '">' +
				caption + requiredCode + '</label>' + eoln;
			result += '<div class="controls">' + eoln;
			result += '<input id="' + field + '" maxlength="250" size="40" type="text"' +
				(isRequired ? ' required="true"' : '') + (value ? ' value="' + value + '"' : '') + '/><br>' + eoln;
			result += '</div>' + eoln;
			result += '</div>' + eoln;
			fieldsCaptionsArrayString += '{fieldName: "' + field + '", caption: "' + caption + '"}, ';
			return result;
			/*jshint quotmark: double */
		}

		function generateScript(entityItem) {
			/*jshint quotmark: false */
			var result = "";
			fieldsCaptionsArrayString =
				fieldsCaptionsArrayString.substring(0, fieldsCaptionsArrayString.length - 2) + "];";
			var requestUrl = Terrasoft.loaderBaseUrl + "0/ServiceModel/GeneratedWebFormService.svc/SaveWebFormLeadData";
			result += '<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js"></script>' + eoln;
			result += '<script type="text/javascript">' + eoln;
			result += 'var bpmjQueryNamespace = {};' + eoln;
			result += 'var webToLeadForm = null;' + eoln;
			result += fieldsCaptionsArrayString + eoln;
			result += 'var fillRequiredFieldsMessage = "' +
				resources.localizableStrings.FillRequiredFormFieldsMessage + '";' + eoln;
			result += 'bpmjQueryNamespace.query = jQuery.noConflict(true);' + eoln;
			result += 'function getFieldCaptionByName(fieldName) {' + eoln;
			result += '	var result = "";' + eoln;
			result += '	for (var i = 0; i < fieldsCaptionsArray.length; i++) {' + eoln;
			result += '		var arrayItem = fieldsCaptionsArray[i];' + eoln;
			result += '		if (arrayItem.fieldName === fieldName) {' + eoln;
			result += '			result = arrayItem.caption;' + eoln;
			result += '			break;' + eoln;
			result += '		}' + eoln;
			result += '	}' + eoln;
			result += '	return result;' + eoln;
			result += '}' + eoln;
			result += 'function getWebToLeadForm() {' + eoln;
			result += '	var result = null;' + eoln;
			result += '	for (var i = 0; i < this.document.forms.length; i++) {' + eoln;
			result += '		var form = this.document.forms[i];' + eoln;
			result += '		if (form.name === "webToLeadForm") {' + eoln;
			result += '			result = form;' + eoln;
			result += '			break;' + eoln;
			result += '		}' + eoln;
			result += '	}' + eoln;
			result += '	return result;' + eoln;
			result += '}' + eoln;
			result += 'function checkFormData() {' + eoln;
			result += '	var result = "";' + eoln;
			result += '	for (var i = 0; i < webToLeadForm.length; i++) {' + eoln;
			result += '		var element = webToLeadForm[i];' + eoln;
			result += '		if (element.type !== "text") {' + eoln;
			result += '			continue;' + eoln;
			result += '		}' + eoln;
			result += '		if ((element.required === "true") && (element.value === "")) {' + eoln;
			result += '			if (!result) {' + eoln;
			result += '				result = fillRequiredFieldsMessage;' + eoln;
			result += '			}' + eoln;
			result += '			result += getFieldCaptionByName(element.id) + ", ";' + eoln;
			result += '		}' + eoln;
			result += '	}' + eoln;
			result += '	if (result) {' + eoln;
			result += '		result = result.substring(0, result.length - 2) + ".";' + eoln;
			result += '	}' + eoln;
			result += '	return result;' + eoln;
			result += '}' + eoln;
			result += 'function getWebToLeadData() {' + eoln;
			result += '	var result = {};' + eoln;
			result += '	result.formFieldsData = [];' + eoln;
			result += '	for (var i = 0; i < webToLeadForm.length; i++) {' + eoln;
			result += '		var element = webToLeadForm[i];' + eoln;
			result += '		if (element.id === "FormId") {' + eoln;
			result += '			result.formId = element.value;' + eoln;
			result += '			continue;' + eoln;
			result += '		}' + eoln;
			result += '		if ((element.type === "hidden") || (element.type === "submit")) {' + eoln;
			result += '			continue;' + eoln;
			result += '		}' + eoln;
			result += '		if (element.constructor && (element.constructor != HTMLInputElement)) {' + eoln;
			result += '			continue;' + eoln;
			result += '		}' + eoln;
			result += '		result.formFieldsData.push({' + eoln;
			result += '			name: element.id,' + eoln;
			result += '			value: element.value' + eoln;
			result += '		});' + eoln;
			result += '	}' + eoln;
			result += '	return result;' + eoln;
			result += '}' + eoln;
			result += 'function sendWebToLeadDataRequest() {' + eoln;
			result += '	webToLeadForm = getWebToLeadForm();' + eoln;
			result += '	var checkResult = checkFormData();' + eoln;
			result += '	if (checkResult) {' + eoln;
			result += '		alert(checkResult);' + eoln;
			result += '		return;' + eoln;
			result += '	}' + eoln;
			result += '		var formData = {formData: getWebToLeadData()};' + eoln;
			result += '		bpmjQueryNamespace.query.ajax({' + eoln;
			result += '			type: "POST",' + eoln;
			result += '			url: "' + requestUrl + '",' + eoln;
			result += '			data: JSON.stringify(formData),' + eoln;
			result += '			contentType : "application/json; charset=UTF-8",' + eoln;
			result += '			crossDomain: true,' + eoln;
			result += '			complete: function() {' + eoln;
			result += '				window.location.href = "' + entityItem.get('ReturnURL') + '";' + eoln;
			result += '			}' + eoln;
			result += '		});' + eoln;
			result += '	}' + eoln;
			result += '</script>';
			return result;
			/*jshint quotmark: double */
		}

		function fieldValueToArray(entity, fieldName) {
			var fieldValue = entity.get(fieldName);
			return (fieldValue) ? Ext.JSON.decode(fieldValue) : [];
		}

		function generateFormCode(scope, recordId, callback) {
			var select = Ext.create("Terrasoft.EntitySchemaQuery", {
					rootSchemaName: "GeneratedWebForm",
					rowCount: 1
				}
			);
			select.addColumn("Id");
			select.addColumn("Name");
			select.addColumn("ExternalURL");
			select.addColumn("ReturnURL");
			select.addColumn("FormFields");
			select.addColumn("EntityDefaultValues");
			select.filters.add("Id",
				select.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL, "Id", recordId));
			select.getEntityCollection(function(response) {
				var entityCollection = response.collection;
				if (entityCollection.getCount() === 0) {
					return;
				}
				var entityItem = entityCollection.getItems()[0];

				/*jshint quotmark: false */
				var html = '<html>' + eoln;
				html += '<head><meta http-equiv="Content-Type" content="text/html; charset=utf-8"></head>' + eoln;
				html += '<body>' + eoln;

				html += '<form class="form-horizontal" name="' + webToLeadFormName +
						'" onSubmit="sendWebToLeadDataRequest(); return false">' + eoln;
				html += '<input type=hidden id="FormId" value="' + entityItem.get("Id") + '"/>' + eoln;
				var fieldsArray = fieldValueToArray(entityItem, "FormFields");
				var entityDefaultValuesArray = fieldValueToArray(entityItem, "EntityDefaultValues");
				var entityDefaultValuesCollection = new Terrasoft.Collection();
				entityDefaultValuesArray.forEach(function(item) {
					entityDefaultValuesCollection.add(item.columnName, item.value);
				});
				fieldsArray.forEach(function(item) {
					var value = "";
					var itemFieldName = (item.field.indexOf("Str") !== -1)
						? item.field.substring(0, item.field.length - 3)
						: item.field;
					if (entityDefaultValuesCollection.contains(itemFieldName)) {
						var entityDefaultValueItem =
							Ext.JSON.decode(entityDefaultValuesCollection.get(itemFieldName));
						if (typeof entityDefaultValueItem === "object") {
							value = entityDefaultValueItem.displayValue;
						} else {
							value = entityDefaultValueItem;
						}
					}
					html += generateInputField(item.field, item.caption, item.isRequired, value);
				});
				//html += eoln;
				html += '<input type="submit" id="submit" value="' +
					resources.localizableStrings.SubmitButtonCaption + '">' + eoln;
				html += '</form>' + eoln;
				html += eoln;
				html += generateScript(entityItem) + eoln;
				html += '</body>' + eoln + '</html>';
				/*jshint quotmark: double */

				callback.call(scope || this, html);
			}, scope || this);
		}

		return {
			initCanManageWebForms: initCanManageWebForms,
			saveFormCodeToFile: saveFormCodeToFile,
			openLeadEditPageDesigner: openLeadEditPageDesigner
		};
	});