import prisma from './client';

async function main() {
  console.log('🌱 Starting AquaSense database seeding...');

  // Clean existing tables in reverse dependency order
  await prisma.aIInsight.deleteMany();
  await prisma.alert.deleteMany();
  await prisma.leak.deleteMany();
  await prisma.sensorReading.deleteMany();
  await prisma.waterUsage.deleteMany();
  await prisma.sensor.deleteMany();
  await prisma.room.deleteMany();
  await prisma.building.deleteMany();
  await prisma.user.deleteMany();

  // 1. Seed Demo User
  const demoUser = await prisma.user.create({
    data: {
      email: 'admin@aquasense.demo',
      passwordHash: 'demo123', // In production, bcrypt hash; simplified for academic prototype
      name: 'Dr. Evelyn Reed (EVS Facility Lead)',
      role: 'Environmental Facility Director',
    },
  });
  console.log(` Created demo user: ${demoUser.email}`);

  // 2. Seed Campus Buildings
  // Coordinates located near institutional campus (lat ~ 12.9716, lng ~ 77.5946 or similar campus layout)
  const bEngineering = await prisma.building.create({
    data: {
      name: 'Engineering & Research Block',
      code: 'BLD-ENG',
      description: 'Houses chemical, computational, and environmental research laboratories with high plumbing network density.',
      type: 'Academic & Laboratory',
      floors: 4,
      latitude: 12.9719,
      longitude: 77.5937,
      dailyBaselineLiters: 18500,
    },
  });

  const bAdmin = await prisma.building.create({
    data: {
      name: 'Central Administration Block',
      code: 'BLD-ADM',
      description: 'Administrative offices, chancellor suites, main archives, and central conference halls.',
      type: 'Administrative',
      floors: 3,
      latitude: 12.9732,
      longitude: 77.5954,
      dailyBaselineLiters: 8200,
    },
  });

  const bHostel = await prisma.building.create({
    data: {
      name: 'Vindhya Student Residence Hall',
      code: 'BLD-HST',
      description: '450-student residential hostel facility with communal restrooms, dining mess, and laundry utilities.',
      type: 'Residential',
      floors: 5,
      latitude: 12.9705,
      longitude: 77.5968,
      dailyBaselineLiters: 34000,
    },
  });

  console.log(' Created 3 institutional buildings.');

  // 3. Seed Rooms & Zones
  // Engineering Block Rooms
  const rEngChemLab = await prisma.room.create({
    data: { name: 'Chemistry & Environmental Analysis Lab', code: 'ENG-102', buildingId: bEngineering.id, floor: 1, areaType: 'Laboratory' },
  });
  const rEngCompLab = await prisma.room.create({
    data: { name: 'High-Performance Computing Center', code: 'ENG-201', buildingId: bEngineering.id, floor: 2, areaType: 'Classroom / Lab' },
  });
  const rEngRestroom = await prisma.room.create({
    data: { name: 'Level 1 West Restroom Complex', code: 'ENG-108', buildingId: bEngineering.id, floor: 1, areaType: 'Restroom' },
  });
  const rEngRooftop = await prisma.room.create({
    data: { name: 'Rooftop Storage Tank & Booster Pump', code: 'ENG-RF01', buildingId: bEngineering.id, floor: 4, areaType: 'Utility Room' },
  });

  // Admin Block Rooms
  const rAdmPantry = await prisma.room.create({
    data: { name: 'Executive Lounge & Staff Pantry', code: 'ADM-104', buildingId: bAdmin.id, floor: 1, areaType: 'Pantry' },
  });
  const rAdmRestroom = await prisma.room.create({
    data: { name: 'Ground Floor Guest Washrooms', code: 'ADM-G02', buildingId: bAdmin.id, floor: 0, areaType: 'Restroom' },
  });
  const rAdmHvac = await prisma.room.create({
    data: { name: 'Basement HVAC Chiller Loop Room', code: 'ADM-B01', buildingId: bAdmin.id, floor: -1, areaType: 'Utility Room' },
  });

  // Hostel Block Rooms
  const rHstMess = await prisma.room.create({
    data: { name: 'Hostel Dining Canteen & Kitchen', code: 'HST-K01', buildingId: bHostel.id, floor: 0, areaType: 'Canteen' },
  });
  const rHstWashroom2 = await prisma.room.create({
    data: { name: 'Floor 2 Wing-B Restroom Block', code: 'HST-204', buildingId: bHostel.id, floor: 2, areaType: 'Restroom' },
  });
  const rHstLaundry = await prisma.room.create({
    data: { name: 'Communal Laundry & Utility Bay', code: 'HST-L01', buildingId: bHostel.id, floor: 1, areaType: 'Utility Room' },
  });
  const rHstMainSupply = await prisma.room.create({
    data: { name: 'Sub-surface Main Inflow Chamber', code: 'HST-M00', buildingId: bHostel.id, floor: 0, areaType: 'Utility Room' },
  });

  console.log(' Created 11 campus rooms and utility zones.');

  // 4. Seed Sensors
  // 12 Realistic Sensors
  const sensorsData = [
    // Engineering Block Sensors
    {
      code: 'S-ENG-101',
      name: 'Lab Water Purification Line Sensor',
      type: 'Ultrasonic Flow Meter',
      buildingId: bEngineering.id,
      roomId: rEngCompLab.id,
      pipeDiameterMm: 20.0,
      baselineFlowLpm: 2.2,
      currentFlowLpm: 2.1,
      status: 'online',
      riskLevel: 'Normal',
      anomalyScore: 4.2,
      latitude: 12.9720,
      longitude: 77.5936,
    },
    {
      code: 'S-ENG-102',
      name: 'Fume Hood Sink Supply Meter',
      type: 'In-line Flow Sensor',
      buildingId: bEngineering.id,
      roomId: rEngChemLab.id,
      pipeDiameterMm: 25.0,
      baselineFlowLpm: 3.5,
      currentFlowLpm: 18.6, // Active major tap leak scenario!
      status: 'leak',
      riskLevel: 'High Risk',
      anomalyScore: 94.8,
      latitude: 12.9718,
      longitude: 77.5938,
    },
    {
      code: 'S-ENG-103',
      name: 'West Wing Flush Valve Inflow Monitor',
      type: 'Pulse Water Meter',
      buildingId: bEngineering.id,
      roomId: rEngRestroom.id,
      pipeDiameterMm: 32.0,
      baselineFlowLpm: 6.0,
      currentFlowLpm: 5.8,
      status: 'online',
      riskLevel: 'Normal',
      anomalyScore: 8.5,
      latitude: 12.9717,
      longitude: 77.5935,
    },
    {
      code: 'S-ENG-104',
      name: 'Rooftop Tank Overflow & Downfeed Meter',
      type: 'Ultrasonic Flow Meter',
      buildingId: bEngineering.id,
      roomId: rEngRooftop.id,
      pipeDiameterMm: 50.0,
      baselineFlowLpm: 12.0,
      currentFlowLpm: 11.4,
      status: 'online',
      riskLevel: 'Normal',
      anomalyScore: 5.0,
      latitude: 12.9721,
      longitude: 77.5939,
    },

    // Admin Block Sensors
    {
      code: 'S-ADM-201',
      name: 'Pantry RO Filtration Inflow Sensor',
      type: 'In-line Flow Sensor',
      buildingId: bAdmin.id,
      roomId: rAdmPantry.id,
      pipeDiameterMm: 15.0,
      baselineFlowLpm: 1.8,
      currentFlowLpm: 1.7, // Previously leaked, now resolved!
      status: 'online',
      riskLevel: 'Normal',
      anomalyScore: 3.1,
      latitude: 12.9731,
      longitude: 77.5953,
    },
    {
      code: 'S-ADM-202',
      name: 'Admin Foyer Water Dispenser Loop',
      type: 'Pulse Water Meter',
      buildingId: bAdmin.id,
      roomId: rAdmRestroom.id,
      pipeDiameterMm: 15.0,
      baselineFlowLpm: 1.2,
      currentFlowLpm: 1.1,
      status: 'online',
      riskLevel: 'Normal',
      anomalyScore: 2.0,
      latitude: 12.9733,
      longitude: 77.5956,
    },
    {
      code: 'S-ADM-203',
      name: 'HVAC Secondary Chiller Cooling Feed',
      type: 'Ultrasonic Flow Meter',
      buildingId: bAdmin.id,
      roomId: rAdmHvac.id,
      pipeDiameterMm: 40.0,
      baselineFlowLpm: 7.5,
      currentFlowLpm: 12.8, // Minor continuous drift / warning
      status: 'warning',
      riskLevel: 'Medium Risk',
      anomalyScore: 68.4,
      latitude: 12.9730,
      longitude: 77.5951,
    },

    // Hostel Block Sensors
    {
      code: 'S-HST-301',
      name: 'Kitchen Commercial Dishwashing Main',
      type: 'In-line Flow Sensor',
      buildingId: bHostel.id,
      roomId: rHstMess.id,
      pipeDiameterMm: 32.0,
      baselineFlowLpm: 14.0,
      currentFlowLpm: 13.8,
      status: 'online',
      riskLevel: 'Normal',
      anomalyScore: 6.7,
      latitude: 12.9704,
      longitude: 77.5966,
    },
    {
      code: 'S-HST-302',
      name: 'Floor 2 Cistern Manifold Meter',
      type: 'Pulse Water Meter',
      buildingId: bHostel.id,
      roomId: rHstWashroom2.id,
      pipeDiameterMm: 25.0,
      baselineFlowLpm: 2.0,
      currentFlowLpm: 7.4, // Persistent flapper leak (5.4 L/min excess)!
      status: 'leak',
      riskLevel: 'High Risk',
      anomalyScore: 88.2,
      latitude: 12.9706,
      longitude: 77.5970,
    },
    {
      code: 'S-HST-303',
      name: 'Laundry Bay Automatic Washer Infeed',
      type: 'Ultrasonic Flow Meter',
      buildingId: bHostel.id,
      roomId: rHstLaundry.id,
      pipeDiameterMm: 25.0,
      baselineFlowLpm: 8.0,
      currentFlowLpm: 7.9,
      status: 'online',
      riskLevel: 'Normal',
      anomalyScore: 4.8,
      latitude: 12.9707,
      longitude: 77.5967,
    },
    {
      code: 'S-HST-304',
      name: 'Sub-surface Master Inflow Aggregator',
      type: 'Ultrasonic Flow Meter',
      buildingId: bHostel.id,
      roomId: rHstMainSupply.id,
      pipeDiameterMm: 75.0,
      baselineFlowLpm: 28.0,
      currentFlowLpm: 33.4, // elevated due to S-HST-302 leak
      status: 'warning',
      riskLevel: 'Low Risk',
      anomalyScore: 38.0,
      latitude: 12.9703,
      longitude: 77.5969,
    },
    {
      code: 'S-HST-305',
      name: 'Rooftop Solar Geyser Make-up Line',
      type: 'In-line Flow Sensor',
      buildingId: bHostel.id,
      roomId: rHstMainSupply.id,
      pipeDiameterMm: 20.0,
      baselineFlowLpm: 3.0,
      currentFlowLpm: 0.0, // Offline / scheduled maintenance
      status: 'offline',
      riskLevel: 'Normal',
      anomalyScore: 0.0,
      latitude: 12.9708,
      longitude: 77.5965,
    },
  ];

  const createdSensors: Record<string, any> = {};
  for (const s of sensorsData) {
    const sensor = await prisma.sensor.create({ data: s });
    createdSensors[sensor.code] = sensor;
  }
  console.log(` Created ${sensorsData.length} simulated IoT sensors.`);

  // 5. Seed Historical Sensor Readings (Last 24 hours, hourly intervals)
  console.log(' Generating time-series sensor telemetry readings...');
  const now = new Date();
  const readingsToInsert: any[] = [];

  for (const [code, sensor] of Object.entries(createdSensors)) {
    let runningConsumption = 1200.0;
    for (let hoursAgo = 24; hoursAgo >= 0; hoursAgo--) {
      const timestamp = new Date(now.getTime() - hoursAgo * 3600 * 1000);
      const hourOfDay = timestamp.getHours();

      // Diurnal coefficient: peaks at 8-11am (1.4x) and 1-3pm (1.2x); dips overnight 12am-5am (0.1x)
      let timeMultiplier = 0.2;
      if (hourOfDay >= 7 && hourOfDay <= 12) timeMultiplier = 1.35;
      else if (hourOfDay > 12 && hourOfDay <= 18) timeMultiplier = 1.1;
      else if (hourOfDay > 18 && hourOfDay <= 22) timeMultiplier = 0.8;
      else timeMultiplier = 0.15;

      let flow = sensor.baselineFlowLpm * timeMultiplier + (Math.sin(hoursAgo) * 0.3);

      // Inject deterministic scenario anomalies
      if (code === 'S-ENG-102') {
        // Leaking continuously for the last 3 hours
        if (hoursAgo <= 3) {
          flow = 18.6;
        }
      } else if (code === 'S-HST-302') {
        // Stuck toilet flapper leaking continuously for the last 6 hours
        if (hoursAgo <= 6) {
          flow = 7.4;
        }
      } else if (code === 'S-ADM-203') {
        // Chiller loop slight elevation last 4 hours
        if (hoursAgo <= 4) {
          flow = 12.8;
        }
      } else if (code === 'S-ADM-201') {
        // Was leaking 18 to 12 hours ago, then resolved
        if (hoursAgo >= 12 && hoursAgo <= 18) {
          flow = 14.0;
        }
      } else if (code === 'S-HST-305') {
        // Offline
        flow = 0;
      }

      flow = Math.max(0, Math.round(flow * 10) / 10);
      runningConsumption += flow * 60; // 60 minutes of flow

      readingsToInsert.push({
        sensorId: sensor.id,
        flowRate: flow,
        totalConsumption: Math.round(runningConsumption),
        timestamp,
      });
    }
  }

  // Batch insert readings
  for (let i = 0; i < readingsToInsert.length; i += 100) {
    const chunk = readingsToInsert.slice(i, i + 100);
    await prisma.sensorReading.createMany({ data: chunk });
  }
  console.log(` Created ${readingsToInsert.length} historical telemetry readings.`);

  // 6. Seed Realistic Leak Incidents
  // Leak 1: Critical - S-ENG-102 Chemistry Lab Tap Fissure / Open Valve
  const leak1 = await prisma.leak.create({
    data: {
      sensorId: createdSensors['S-ENG-102'].id,
      buildingId: bEngineering.id,
      roomId: rEngChemLab.id,
      severity: 'Critical',
      probability: 95.8,
      anomalyScore: 94.8,
      status: 'Detected',
      estimatedLossLiters: 2718.0, // (18.6 - 3.5 L/min) * 180 min
      lossRateLph: 906.0, // (18.6 - 3.5) * 60
      currentFlowRate: 18.6,
      baselineFlowRate: 3.5,
      aiExplanation: 'Sensor S-ENG-102 recorded continuous flow 5.3× above normal baseline for 180 consecutive minutes. Deviation is persistent with zero pressure fluctuation recovery, strongly indicating an unthrottled faucet or failed valve seal.',
      recommendedAction: 'Dispatch emergency plumbing maintenance to Chemistry Lab Room ENG-102 immediately. Isolate secondary manifold shut-off valve V-12B.',
      startTime: new Date(now.getTime() - 3 * 3600 * 1000),
    },
  });

  // Leak 2: High - S-HST-302 Hostel Restroom Silent Flapper Leak
  const leak2 = await prisma.leak.create({
    data: {
      sensorId: createdSensors['S-HST-302'].id,
      buildingId: bHostel.id,
      roomId: rHstWashroom2.id,
      severity: 'High',
      probability: 88.4,
      anomalyScore: 88.2,
      status: 'Investigating',
      estimatedLossLiters: 1944.0, // (7.4 - 2.0) * 360 min
      lossRateLph: 324.0,
      currentFlowRate: 7.4,
      baselineFlowRate: 2.0,
      aiExplanation: 'Sensor S-HST-302 detected continuous flow of 5.4 L/min during low-occupancy overnight period (01:00 - 05:00). High persistence without cyclic recharge confirms a failed toilet cistern flapper gasket or overflow tube siphon.',
      recommendedAction: 'Inspect Floor 2 Wing-B cistern units #3 and #4. Replace degraded silicone rubber flapper seals.',
      startTime: new Date(now.getTime() - 6 * 3600 * 1000),
    },
  });

  // Leak 3: Medium - S-ADM-203 Basement HVAC Chiller Secondary Line
  const leak3 = await prisma.leak.create({
    data: {
      sensorId: createdSensors['S-ADM-203'].id,
      buildingId: bAdmin.id,
      roomId: rAdmHvac.id,
      severity: 'Medium',
      probability: 68.4,
      anomalyScore: 68.4,
      status: 'Detected',
      estimatedLossLiters: 1272.0,
      lossRateLph: 318.0,
      currentFlowRate: 12.8,
      baselineFlowRate: 7.5,
      aiExplanation: 'Sensor S-ADM-203 registered flow 1.7× above expected cooling demand baseline with high standard deviation. Pattern suggests micro-fissure or pressure relief valve weep.',
      recommendedAction: 'Inspect basement chiller room pipe coupling C-09 and verify expansion vessel pressure gauge.',
      startTime: new Date(now.getTime() - 4 * 3600 * 1000),
    },
  });

  // Leak 4: Resolved - S-ADM-201 Staff Pantry Sink Line
  const leak4 = await prisma.leak.create({
    data: {
      sensorId: createdSensors['S-ADM-201'].id,
      buildingId: bAdmin.id,
      roomId: rAdmPantry.id,
      severity: 'Medium',
      probability: 76.0,
      anomalyScore: 75.0,
      status: 'Resolved',
      estimatedLossLiters: 1830.0,
      lossRateLph: 305.0,
      currentFlowRate: 1.7,
      baselineFlowRate: 1.8,
      aiExplanation: 'Incident resolved. Continuous tap drip was reported and corrected by facility technician via cartridge replacement at 14:30.',
      recommendedAction: 'Routine verification complete. Flow normalized to baseline (1.7 L/min).',
      startTime: new Date(now.getTime() - 20 * 3600 * 1000),
      endTime: new Date(now.getTime() - 14 * 3600 * 1000),
    },
  });

  console.log(' Created 4 leak incidents (2 active, 1 investigating, 1 resolved).');

  // 7. Seed Actionable Alerts
  await prisma.alert.create({
    data: {
      leakId: leak1.id,
      sensorId: createdSensors['S-ENG-102'].id,
      buildingId: bEngineering.id,
      severity: 'Critical',
      title: 'Urgent: Major Uncontrolled Flow Detected in Chemistry Lab',
      message: 'Continuous flow rate of 18.6 L/min detected (5.3× normal baseline). Over 2,700 Liters wasted since event inception.',
      leakProbability: 95.8,
      estimatedWastage: 2718.0,
      recommendedAction: 'Dispatch maintenance to ENG-102 immediately to close isolation valve V-12B.',
      isRead: false,
      isResolved: false,
      createdAt: new Date(now.getTime() - 170 * 60 * 1000),
    },
  });

  await prisma.alert.create({
    data: {
      leakId: leak2.id,
      sensorId: createdSensors['S-HST-302'].id,
      buildingId: bHostel.id,
      severity: 'High',
      title: 'Overnight Cistern Leak in Vindhya Residence Hall',
      message: 'Persistent continuous flow (7.4 L/min) detected across 6 consecutive hours during overnight low-use period.',
      leakProbability: 88.4,
      estimatedWastage: 1944.0,
      recommendedAction: 'Inspect Floor 2 Wing-B cistern seals and replace malfunctioning flapper gaskets.',
      isRead: true,
      isResolved: false,
      createdAt: new Date(now.getTime() - 350 * 60 * 1000),
    },
  });

  await prisma.alert.create({
    data: {
      leakId: leak3.id,
      sensorId: createdSensors['S-ADM-203'].id,
      buildingId: bAdmin.id,
      severity: 'Medium',
      title: 'Elevated Flow in Basement HVAC Chiller Feed',
      message: 'Current flow 12.8 L/min exceeds baseline by 70%. Sustained deviation over 4 hours indicates potential weeping joint.',
      leakProbability: 68.4,
      estimatedWastage: 1272.0,
      recommendedAction: 'Conduct visual check on pipe coupling C-09 in basement chiller room.',
      isRead: false,
      isResolved: false,
      createdAt: new Date(now.getTime() - 230 * 60 * 1000),
    },
  });

  await prisma.alert.create({
    data: {
      leakId: leak4.id,
      sensorId: createdSensors['S-ADM-201'].id,
      buildingId: bAdmin.id,
      severity: 'Low',
      title: 'Resolved: Pantry Sink Faucet Leak Rectified',
      message: 'Leak status updated to Resolved. Flow has stabilized within normal operating parameters (<1.8 L/min).',
      leakProbability: 10.0,
      estimatedWastage: 0.0,
      recommendedAction: 'No further action required. System logging normal baseline.',
      isRead: true,
      isResolved: true,
      createdAt: new Date(now.getTime() - 14 * 3600 * 1000),
    },
  });

  console.log(' Created 4 alerts.');

  // 8. Seed Historical Water Usage (Last 30 Days)
  console.log(' Generating 30-day historical water usage records for all buildings...');
  const buildings = [bEngineering, bAdmin, bHostel];
  const usageRecords: any[] = [];

  for (let d = 30; d >= 0; d--) {
    const dateObj = new Date(now.getTime() - d * 24 * 3600 * 1000);
    const dateStr = dateObj.toISOString().split('T')[0];
    const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;

    for (const b of buildings) {
      let expected = b.dailyBaselineLiters;
      if (isWeekend) {
        expected = b.code === 'BLD-HST' ? expected * 1.15 : expected * 0.35;
      }

      // Add realistic daily fluctuation (-8% to +10%)
      const noise = (Math.sin(d * 1.5 + b.name.length) * 0.08);
      let actual = expected * (1 + noise);

      // Add leak impact for today and yesterday
      if (d === 0) {
        if (b.code === 'BLD-ENG') actual += 2718;
        if (b.code === 'BLD-HST') actual += 1944;
        if (b.code === 'BLD-ADM') actual += 1272;
      }

      // Water saved: early alert detection saved water by preventing multi-day runaways
      const saved = Math.max(0, Math.round((expected * 0.12) + (Math.cos(d) * 150)));

      usageRecords.push({
        buildingId: b.id,
        date: dateStr,
        hour: null,
        actualConsumption: Math.round(actual),
        expectedConsumption: Math.round(expected),
        waterSaved: saved,
      });
    }
  }

  for (let i = 0; i < usageRecords.length; i += 100) {
    const chunk = usageRecords.slice(i, i + 100);
    await prisma.waterUsage.createMany({ data: chunk });
  }
  console.log(` Created ${usageRecords.length} daily water usage records.`);

  // 9. Seed AI Environmental Insights
  const insights = [
    {
      buildingId: bEngineering.id,
      sensorId: createdSensors['S-ENG-102'].id,
      type: 'LEAK_DETECTION',
      title: 'Persistent High-Volume Leak Detected in Chemical Lab ENG-102',
      description: 'Sensor S-ENG-102 has recorded continuous anomalous flow 5.3× above historical baseline for 180 consecutive minutes. At current loss rate (906 L/h), an estimated 21,744 Liters will be wasted over 24 hours if uncorrected.',
      confidence: 96.4,
      metricValue: 2718.0,
    },
    {
      buildingId: bHostel.id,
      sensorId: createdSensors['S-HST-302'].id,
      type: 'ANOMALY_WARNING',
      title: 'Overnight Phantom Flow Anomaly in Vindhya Residence Hall',
      description: 'Restroom zone HST-204 experienced sustained flow of 7.4 L/min between 01:00 and 05:00 UTC. Night baseline is typically 0.2 L/min. This silent leak profile matches a stuck toilet cistern flapper.',
      confidence: 88.2,
      metricValue: 1944.0,
    },
    {
      buildingId: bAdmin.id,
      type: 'CONSERVATION_OPPORTUNITY',
      title: 'Weekend Base Flow Reduction Opportunity',
      description: 'Administration Block baseline consumption drops by only 65% on non-operational weekends, compared to campus benchmark target of 85%. Automated shutoff valves on non-critical lines could conserve ~3,200 Liters/weekend.',
      confidence: 91.0,
      metricValue: 3200.0,
    },
    {
      type: 'EFFICIENCY_IMPACT',
      title: 'Cumulative Conservation Impact: 48,250 Liters Saved This Month',
      description: 'Rapid algorithmic anomaly detection and technician response averted 4 prolonged structural leak events across campus, preserving 48,250 Liters of treated potable water and preventing ~67.5 kWh of pumping energy expenditure.',
      confidence: 94.5,
      metricValue: 48250.0,
    },
  ];

  for (const ins of insights) {
    await prisma.aIInsight.create({ data: ins });
  }
  console.log(` Created ${insights.length} AI environmental insights.`);

  console.log('✅ AquaSense database seeding successfully completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
