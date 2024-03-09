import { express, Router } from "express"
import bodyParser from 'body-parser';
import { MonitorControler } from "../../controller/monitorController"

const router = Router()

  // API Midware
  router.use(bodyParser.urlencoded({ extended: true }));
  router.use(bodyParser.json());

  router.use((req, res, next) => {
    // set the CORS policy
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
    // set the CORS headers
    res.header(
      'Access-Control-Allow-Headers',
      'origin,X-Requested-With,Content-Type,Accept,Authorization'
    );
    // set the CORS method headers
    if (req.method === 'OPTIONS') {
      res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE');
      return res.status(200).json({});
    }
    next();
  });
  
  router.post('/addPr', MonitorControler.addNewPr)
  router.get('/getGraph', MonitorControler.getGraph)
  router.post('/setDependency', MonitorControler.addDependency)
  router.post('/setStatus', MonitorControler.setStatus)
  router.get('/findPr/:prId', MonitorControler.getPr)
  

  /** Error handling */
  router.use((_, res) => {
    const error = new Error('not found');
    return res.status(404).json({
      message: error.message,
    });
  });


module.exports = router