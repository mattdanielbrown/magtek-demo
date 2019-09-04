var devideID;

$(document).ready(function() {
	$.ajax({
    method: 'POST',
    url: 'http://localhost:9002/api/mtscrahost/RequestDeviceList',
    data: {
      'WaitTime': 10,
      'ConnectionType': 4,
    },
    success: function (result) {
      console.log('success', result)
      devideID = result.DeviceList[0].Value
      $('#devide_id').html("<b>Device ID: </b>" + devideID).removeClass('blink');
      $('#dipResultWr').show();
    },
    error: function(result) {
      console.log('error', result)
    }
  });
})


function doDIP() {
  return new Promise( (resolve, reject) => {
    $("#swipeResultWr").hide();
    $('#dipRequestWr').show();
    $('#dip_request').hide();
    $.ajax({
      method: 'POST',
      url: 'http://localhost:9002/api/mtscrahost/RequestSmartCard',
      data: {
        'WaitTime': 20,
        'ConnectionType': 4,
        'DeviceID': devideID,
        'TransactionType': '0x00',
        'CardType': 3,
        'Amount': 10,
        'CashBack': 0,
        'CurrencyCode': '0840',
        'ReportOptions': 2,
        'Options': 0
      },
      success: function (result) {
        console.log('success DIP', result)
        $('#dipResponceWr').show();
        $('#dipRequestWr').hide();
        resolve(result);
      },
      error: function(error) {
        console.log('error', error)
        $('#swipeBtn').get(0).disabled=false;
        $('#dipRequestWr').hide();
        $("#error").show();
      }
    });
  });
}

function requestDIP() {
  doDIP().then(result => {
    console.log('DIP DATA', result)
    $('#DIP_Data_result').show().html(result.ResponseOutput.ARQCData);
    collectInit(result.ResponseOutput.ARQCData)
  });
}

function collectInit (arqc) {
  var f = VGSCollect.create('tntn962vs90', function (state) {});

  f.field('#cardData .fake-input', {
    type: 'card-security-code',
    name: 'cvv',
    placeholder: 'cvv',
    validations: ['required', 'validCardSecurityCode'],
  });
  
  document.getElementById('ccForm').addEventListener('submit', function(e) {
    e.preventDefault();
    $('#submit_button').addClass('is-loading')
    f.submit('/decrypt', {
      data: {
        type: "dip",
        data: {
          arqc: arqc
        }
      }
    }, function(status, data) {
      console.log('data', data)
      $('#submit_button').removeClass('is-loading')
      $('#dipResponceWr').hide()
      $('#CollectResponceWr').show()
      $('#CollectResponce').html(`
      
      curl https://echo.apps.verygood.systems/post -k \\
      -x US4uMsMXjxHRByT2sQWHzJW8:7354c963-484f-45af-9aa0-6430e1968834@tntn962vs90.sandbox.verygoodproxy.com:8080 \\
      -H "Content-type: application/json" \\
      -d '${JSON.stringify(data.json)}'
      `);
      $('pre code').each(function(i, block) {
        hljs.highlightBlock(block);
      });
    });
  }, false);
};
