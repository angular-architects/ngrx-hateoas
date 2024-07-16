// server.js
const jsonServer = require('json-server');
const db = require('./db.json');
const server = jsonServer.create();
const middlewares = jsonServer.defaults();

server.use(middlewares);

server.use(jsonServer.bodyParser);

server.get('/api', (req, res) => {
  const result = { apiName: 'Dummy API' };
  result._links = {
    homeVm: { href: 'http://localhost:5100/views/homeVm' },
    flightSearchVm: { href: "http://localhost:5100/views/flightSearchVm" },
    userinfo: { href: "http://localhost:5100/userinfo" }
  };
  res.jsonp(result);
});

server.get('/userinfo', (req, res) => {
  res.jsonp(db.userinfo);
});

server.get('/views/homeVm', (req, res) => {
  const result = {
    flightManagementSummary: {
      flightCount: db.flights.length,
      passengerCount: 28,
      averagePassengerCountPerFlight: 28 / db.flights.length
    },
    flightShoppingSummary: {
      maxBasePrice: 350,
      minBasePrice: 90,
      averagePrice: 210
    }
  };
  res.jsonp(result);
});

server.get('/views/flightSearchVm', (req, res) => {
  let flights = db.flights;

  if (req.query.from) {
    flights = flights.filter(f => f.connection.from === req.query.from);
  }

  if (req.query.to) {
    flights = flights.fill(f => f.connection.to === req.query.to);
  }

  if (req.query.from === undefined && req.query.to === undefined) {
    flights = [];
  }

  flights.forEach(flight => {
    flight._links = { flightEditVm: { href: 'http://localhost:5100/views/flightEditVm/' + flight.id } };
  });

  const result = {
    from: req.query.from ?? null,
    to: req.query.to ?? null,
    flights
  };

  result._links = {
    flightSearchVm: { href: 'http://localhost:5100/views/flightSearchVm' },
    flightCreateVm: { href: 'http://localhost:5100/views/flightCreateVm' }
  }

  res.jsonp(result);
});

server.get('/views/flightCreateVm', (req, res) => {
  const result = {
    template: {
      connection: {
        from: '',
        to: "",
        icaoFrom: null,
        icaoTo: null
      },
      times: {
        takeOff: '2024-06-04T14:40:56.4443436+02:00',
        landing: '2024-06-04T17:40:56.4443669+02:00'
      },
      operator: {
        name: '',
        shortName: '',
        aircraftId: 0
      }
    },
    aircrafts: db.aircrafts
  };

  result.template._actions = { create: { method: 'POST', href: 'http://localhost:5100/flights' } };

  res.jsonp(result);
});

server.get('/views/flightEditVm/:flightId', (req, res) => {
  const flightId = req.params.flightId;
  const flight = db.flights.find(v => v.id == flightId);
  flight.connection._actions = { update: { method: 'PUT', href: `http://localhost:5100/flights/${flightId}/connection` } };
  flight.times._actions = { update: { method: 'PUT', href: `http://localhost:5100/flights/${flightId}/times` } }
  flight.operator._actions = { update: { method: 'PUT', href: `http://localhost:5100/flights/${flightId}/operator` } }
  if(flight.price) {
    flight.price._actions = { update: { method: 'PUT', href: `http://localhost:5100/flights/${flightId}/price` } }
  } else {
    flight.price = {
      basePrice: 0,
      seatReservationSurcharge: 0,
      premiumSurcharge: 0,
      businessSurcharge: 0
    }
  }
  res.jsonp({
    flight,
    aircrafts: db.aircrafts
  });
});

server.post('/flights', (req, res) => {
  req.body.id = Math.ceil(Math.random() * 100);
  db.flights.push(req.body);
  res.sendStatus(204);
});

server.put('/flights/:flightId/connection', (req, res) => {
  const flightId = req.params.flightId;
  const flight = db.flights.find(v => v.id == flightId);
  flight.connection = req.body;
  res.sendStatus(204);
});

server.put('/flights/:flightId/times', (req, res) => {
  const flightId = req.params.flightId;
  const flight = db.flights.find(v => v.id == flightId);
  flight.times = req.body;
  res.sendStatus(204);
});

server.put('/flights/:flightId/operator', (req, res) => {
  const flightId = req.params.flightId;
  const flight = db.flights.find(v => v.id == flightId);
  flight.operator = req.body;
  res.sendStatus(204);
});

server.put('/flights/:flightId/price', (req, res) => {
  const flightId = req.params.flightId;
  const flight = db.flights.find(v => v.id == flightId);
  flight.price = req.body;
  res.sendStatus(204);
});

server.listen(5100, () => {
  console.log('JSON Server is running');
});
