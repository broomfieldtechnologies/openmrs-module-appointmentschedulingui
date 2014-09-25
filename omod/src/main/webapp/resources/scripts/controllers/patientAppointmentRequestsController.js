angular.module('appointmentscheduling')
    .controller('PatientAppointmentRequestsCtrl', ['$scope', '$rootScope', 'AppointmentService','filterFilter', 'ngGridHelper',
        function ($scope, $rootScope, AppointmentService, filterFilter, ngGridHelper) {

            // TODO: don't hard-code PENDING?
            // TODO: column widths

            $scope.showAppointmentRequests = false;
            $scope.showCancelAppointmentRequest = false;
            $scope.appointmentRequestToCancel;
            $scope.appointmentRequests = [];

            $scope.init = function(patientUuid, canBook) {
                $scope.patientUuid = patientUuid;
                $scope.canBook = canBook;
                $scope.findAppointmentRequests();
            },

            $scope.appointmentRequestsGrid = {
                data: 'appointmentRequests',
                multiSelect: false,
                enableSorting: false,
                i18n: jsLocale,
                selectedItems: [],
                columnDefs: [   { field: 'appointmentType.display', width: '40%', displayName: emr.message("appointmentschedulingui.scheduleAppointment.serviceType") },
                                { field: 'provider.person.display', width: '20%', displayName: emr.message("appointmentschedulingui.scheduleAppointment.provider") },
                                { field: 'timeFrame', width: '30%', displayName: emr.message("appointmentschedulingui.scheduleAppointment.requestTimeFrame") },
                                { displayName: emr.message("appointmentschedulingui.scheduleAppointment.actions"),
                                    cellTemplate: '<span><i class="delete-item icon-calendar" ng-click="bookAppointment(row)" ' +
                                                    'title="{{ row.getProperty(\'bookAppointmentTooltip\') }}"></i></span>      ' +
                                                    '<span><i class="delete-item icon-remove" ng-click="cancelAppointmentRequest(row.getProperty(\'uuid\'))" ' +
                                                    'title="{{ row.getProperty(\'cancelRequestTooltip\') }}"></i></span>'}],
                plugins: [new ngGridFlexibleHeightPlugin()]

            };

            $scope.findAppointmentRequests = function() {

                AppointmentService.getAppointmentRequests({ patient: $scope.patientUuid, status: 'PENDING' }).then(function (results) {

                    angular.forEach(results, function(result) {
                        // format time frame
                        var from = result.minTimeFrameValue ? result.minTimeFrameValue + ' ' + emr.message('appointmentschedulingui.timeframeunits.' + result.minTimeFrameUnits) : '';
                        var to = result.maxTimeFrameValue ? result.maxTimeFrameValue + ' ' + emr.message('appointmentschedulingui.timeframeunits.' + result.maxTimeFrameUnits) : '';
                        result['timeFrame'] = (from ? from + ' - ' : '') + to;

                        result['cancelRequestTooltip'] = emr.message("appointmentschedulingui.scheduleAppointment.cancelAppointmentRequest.tooltip");
                        result['bookAppointmentTooltip'] = emr.message("appointmentschedulingui.scheduleAppointment.bookAppointment.tooltip");
                    });


                    $scope.appointmentRequests = results;
                    $scope.showAppointmentRequests = $scope.appointmentRequests && $scope.appointmentRequests.length > 0;
                })
                    .catch(function(e) {
                        console.log(e);
                    });
            }

            $scope.cancelAppointmentRequest = function(uuid) {
                $scope.appointmentRequestToCancel = { uuid: uuid };
                $scope.showCancelAppointmentRequest = true;
                angular.element('#confirm-cancel-appointment-request .confirm').focus();
            }

            $scope.bookAppointment = function(row) {

                var eventData = {
                    appointmentRequest: row.entity
                };

                // picked up by the schedule appointment controller
                $rootScope.$broadcast('appointmentscheduling.patientAppointmentRequests.requestSelected', eventData);
            }

            $scope.doCancelAppointmentRequest = function() {

                AppointmentService.cancelAppointmentRequest($scope.appointmentRequestToCancel).then(function(result) {
                    $scope.showCancelAppointmentRequest = false;
                    $scope.findAppointmentRequests();  // reload
                }).catch(function (e) {
                        // error callback
                        console.log(e);
                        $scope.appointmentRequestToCancel = null;
                        emr.errorMessage("appointmentschedulingui.scheduleAppointment.errorCancelingAppointmentRequest");
                    })
            }

            $scope.doNotCancelAppointmentRequest = function() {
                $scope.appointmentRequestToCancel = null;
                $scope.showCancelAppointmentRequest = false;
            }

            // events emitted by other controllers that this controller handles

            // hide display if the schedule appointment app opens it's confirm dialog
            $scope.$on('appointmentscheduling.scheduleAppointment.openConfirmDialog', function() {
                $scope.showAppointmentRequests = false;
            });

            // show display if the schedule appointment app closes it's confirm dialog
            $scope.$on('appointmentscheduling.scheduleAppointment.cancelConfirmDialog', function(event, eventData) {
                $scope.showAppointmentRequests = true;
            });


            /*// the parent schedule appointment scope can call this to tell the appointment requests grid to de-select all items
            $scope.$on('appointmentscheduling.patientAppointmentRequests.deselectAppointmentRequests', function() {
                $scope.appointmentRequestsGrid.selectedItems = [];
                angular.element("#appointmentRequestsGridTable div.selected").removeClass("selected");
            });*/

        }])




















