import React, { useState } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Shield, Cpu, Database, Activity, TrendingUp, CheckCircle, XCircle, Server, Cloud, Video, Leaf } from 'lucide-react';

const CyberConsumptionPresentation = () => {
  const [activeSlide, setActiveSlide] = useState(0);

  // Données pour les graphiques - Cybersécurité
  const cpuConsumptionData = [
    { tool: 'Antivirus', consumption: 15 },
    { tool: 'Firewall', consumption: 8 },
    { tool: 'IDS/IPS', consumption: 35 },
    { tool: 'SIEM', consumption: 45 },
    { tool: 'EDR', consumption: 25 },
    { tool: 'Scan Vulnérabilités', consumption: 60 }
  ];

  const networkTrafficData = [
    { month: 'Jan', normal: 100, attack: 120 },
    { month: 'Fév', normal: 105, attack: 150 },
    { month: 'Mar', normal: 110, attack: 180 },
    { month: 'Avr', normal: 108, attack: 250 },
    { month: 'Mai', normal: 112, attack: 200 },
    { month: 'Jun', normal: 115, attack: 170 }
  ];

  const securityCostsData = [
    { category: 'Monitoring 24/7', value: 30 },
    { category: 'Analyse logs', value: 25 },
    { category: 'Détection menaces', value: 20 },
    { category: 'Réponse incidents', value: 15 },
    { category: 'Backup & Recovery', value: 10 }
  ];

  const attackImpactData = [
    { type: 'DDoS', bandwidth: 85, cpu: 90, ram: 60 },
    { type: 'Ransomware', bandwidth: 30, cpu: 70, ram: 80 },
    { type: 'Bruteforce', bandwidth: 20, cpu: 95, ram: 40 },
    { type: 'Malware', bandwidth: 40, cpu: 75, ram: 85 }
  ];

  // Nouvelles données - Consommation générale IT
  const dataCenterEnergyData = [
    { year: '2018', consumption: 200, co2: 180 },
    { year: '2019', consumption: 220, co2: 195 },
    { year: '2020', consumption: 240, co2: 210 },
    { year: '2021', consumption: 260, co2: 225 },
    { year: '2022', consumption: 280, co2: 240 },
    { year: '2023', consumption: 300, co2: 255 }
  ];

  const equipmentConsumptionData = [
    { device: 'Serveurs', consumption: 180, growth: 15 },
    { device: 'Ordinateurs', consumption: 120, growth: 8 },
    { device: 'Smartphones', consumption: 80, growth: 25 },
    { device: 'Tablettes', consumption: 40, growth: 10 },
    { device: 'IoT', consumption: 60, growth: 35 }
  ];

  const cloudStorageData = [
    { category: 'Photos/Vidéos', value: 35 },
    { category: 'Documents', value: 15 },
    { category: 'Emails', value: 20 },
    { category: 'Backup', value: 18 },
    { category: 'Streaming cache', value: 12 }
  ];

  const streamingImpactData = [
    { quality: 'SD (480p)', bandwidth: 1, energy: 0.3, co2: 0.1 },
    { quality: 'HD (720p)', bandwidth: 3, energy: 0.9, co2: 0.3 },
    { quality: 'Full HD', bandwidth: 5, energy: 1.5, co2: 0.5 },
    { quality: '4K', bandwidth: 15, energy: 4.5, co2: 1.5 },
    { quality: '8K', bandwidth: 50, energy: 15, co2: 5 }
  ];

  const internetTrafficData = [
    { service: 'Streaming vidéo', percentage: 60 },
    { service: 'Gaming', percentage: 15 },
    { service: 'Réseaux sociaux', percentage: 12 },
    { service: 'Email/Web', percentage: 8 },
    { service: 'Autres', percentage: 5 }
  ];

  const greenSolutionsData = [
    { solution: 'Énergies renouvelables', impact: 85 },
    { solution: 'Refroidissement optimisé', impact: 40 },
    { solution: 'Virtualisation', impact: 60 },
    { solution: 'Optimisation logicielle', impact: 30 },
    { solution: 'Stockage intelligent', impact: 35 }
  ];

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  const slides = [
    {
      title: "Consommation des Ressources en Cybersécurité",
      subtitle: "Impact des outils et menaces sur l'infrastructure IT",
      icon: Shield
    },
    {
      title: "Consommation CPU des Outils de Sécurité",
      content: (
        <div className="space-y-4">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={cpuConsumptionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="tool" angle={-15} textAnchor="end" height={80} style={{fontSize: '12px'}} />
              <YAxis label={{ value: 'CPU Usage (%)', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Bar dataKey="consumption" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-50 border-l-4 border-green-500 p-3 rounded">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <h3 className="font-bold text-green-900">Avantages</h3>
              </div>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Protection en temps réel</li>
                <li>• Détection proactive des menaces</li>
                <li>• Visibilité complète du système</li>
                <li>• Conformité réglementaire</li>
              </ul>
            </div>
            
            <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="w-5 h-5 text-red-600" />
                <h3 className="font-bold text-red-900">Inconvénients</h3>
              </div>
              <ul className="text-sm text-red-800 space-y-1">
                <li>• Ralentissement système (15-60% CPU)</li>
                <li>• Coûts de licence élevés</li>
                <li>• Faux positifs fréquents</li>
                <li>• Complexité de configuration</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Impact des Attaques sur le Trafic Réseau",
      content: (
        <div className="space-y-4">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={networkTrafficData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis label={{ value: 'Trafic (GB)', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="normal" stroke="#10b981" strokeWidth={2} name="Trafic Normal" />
              <Line type="monotone" dataKey="attack" stroke="#ef4444" strokeWidth={2} name="Sous Attaque" />
            </LineChart>
          </ResponsiveContainer>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-50 border-l-4 border-green-500 p-3 rounded">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <h3 className="font-bold text-green-900">Détection rapide</h3>
              </div>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Alertes automatiques</li>
                <li>• Historique d'analyse</li>
                <li>• Identification des patterns</li>
              </ul>
            </div>
            
            <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="w-5 h-5 text-red-600" />
                <h3 className="font-bold text-red-900">Conséquences</h3>
              </div>
              <ul className="text-sm text-red-800 space-y-1">
                <li>• Surcharge bande passante (+130%)</li>
                <li>• Services indisponibles</li>
                <li>• Coûts réseau supplémentaires</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Répartition des Coûts de Sécurité",
      content: (
        <div className="space-y-4">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={securityCostsData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ category, value }) => `${category}: ${value}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {securityCostsData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-50 border-l-4 border-green-500 p-3 rounded">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <h3 className="font-bold text-green-900">Avantages</h3>
              </div>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Couverture complète 24/7</li>
                <li>• Réduction des incidents</li>
                <li>• Traçabilité des événements</li>
                <li>• Automatisation des processus</li>
              </ul>
            </div>
            
            <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="w-5 h-5 text-red-600" />
                <h3 className="font-bold text-red-900">Inconvénients</h3>
              </div>
              <ul className="text-sm text-red-800 space-y-1">
                <li>• Coût élevé du personnel</li>
                <li>• Stockage massif de logs</li>
                <li>• Consommation énergétique</li>
                <li>• Expertise technique requise</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Impact des Types d'Attaques sur les Ressources",
      content: (
        <div className="space-y-4">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={attackImpactData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="type" />
              <YAxis label={{ value: 'Impact (%)', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="bandwidth" fill="#3b82f6" name="Bande Passante" />
              <Bar dataKey="cpu" fill="#10b981" name="CPU" />
              <Bar dataKey="ram" fill="#f59e0b" name="RAM" />
            </BarChart>
          </ResponsiveContainer>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="bg-blue-50 p-2 rounded">
                <p className="font-bold text-blue-900 text-sm">DDoS</p>
                <p className="text-xs text-blue-700">✓ Facile à détecter</p>
                <p className="text-xs text-red-700">✗ Sature le réseau</p>
              </div>
              <div className="bg-purple-50 p-2 rounded">
                <p className="font-bold text-purple-900 text-sm">Ransomware</p>
                <p className="text-xs text-purple-700">✓ Backup efficace</p>
                <p className="text-xs text-red-700">✗ Perte de données</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="bg-green-50 p-2 rounded">
                <p className="font-bold text-green-900 text-sm">Bruteforce</p>
                <p className="text-xs text-green-700">✓ Blocage par firewall</p>
                <p className="text-xs text-red-700">✗ Consomme 95% CPU</p>
              </div>
              <div className="bg-orange-50 p-2 rounded">
                <p className="font-bold text-orange-900 text-sm">Malware</p>
                <p className="text-xs text-orange-700">✓ Antivirus détecte</p>
                <p className="text-xs text-red-700">✗ Persiste en mémoire</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Comparaison Globale : Avantages vs Inconvénients",
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <h2 className="text-2xl font-bold text-green-900">Avantages</h2>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-bold text-green-900 mb-2">Protection Proactive</h3>
                <p className="text-sm text-green-800">Détection en temps réel des menaces avant qu'elles ne causent des dommages</p>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-bold text-green-900 mb-2">Visibilité Totale</h3>
                <p className="text-sm text-green-800">Surveillance continue de toute l'infrastructure IT</p>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-bold text-green-900 mb-2">Conformité</h3>
                <p className="text-sm text-green-800">Respect des normes (GDPR, ISO 27001, PCI-DSS)</p>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-bold text-green-900 mb-2">Automatisation</h3>
                <p className="text-sm text-green-800">Réponse automatique aux incidents simples</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <XCircle className="w-8 h-8 text-red-600" />
                <h2 className="text-2xl font-bold text-red-900">Inconvénients</h2>
              </div>
              
              <div className="bg-red-50 p-4 rounded-lg">
                <h3 className="font-bold text-red-900 mb-2">Coûts Élevés</h3>
                <p className="text-sm text-red-800">Licences, matériel, personnel spécialisé (30-40% du budget IT)</p>
              </div>
              
              <div className="bg-red-50 p-4 rounded-lg">
                <h3 className="font-bold text-red-900 mb-2">Performance Système</h3>
                <p className="text-sm text-red-800">Ralentissement de 15% à 60% selon les outils actifs</p>
              </div>
              
              <div className="bg-red-50 p-4 rounded-lg">
                <h3 className="font-bold text-red-900 mb-2">Complexité</h3>
                <p className="text-sm text-red-800">Configuration difficile, expertise technique nécessaire</p>
              </div>
              
              <div className="bg-red-50 p-4 rounded-lg">
                <h3 className="font-bold text-red-900 mb-2">Faux Positifs</h3>
                <p className="text-sm text-red-800">Alertes non pertinentes (jusqu'à 30% des alertes)</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Transition : Consommation Générale des Ressources IT",
      subtitle: "Au-delà de la cybersécurité, l'impact environnemental du numérique",
      icon: Activity,
      content: (
        <div className="flex items-center justify-center h-full">
          <div className="text-center space-y-6">
            <div className="flex justify-center gap-8">
              <Server className="w-24 h-24 text-blue-500" />
              <Cloud className="w-24 h-24 text-green-500" />
              <Video className="w-24 h-24 text-purple-500" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800">Partie 2</h2>
            <h3 className="text-2xl font-semibold text-gray-700">Consommation des Ressources Informatiques</h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              L'impact invisible mais énorme sur l'environnement : énergie, machines, réseaux et stockage de données
            </p>
            <div className="bg-blue-50 border-2 border-blue-300 p-4 rounded-lg max-w-2xl mx-auto">
              <p className="text-gray-700 italic">
                💡 "Lconsommation dyal ressources informatiques hya dak lktar dyal l'énergie li katsrafha les serveurs, 
                les téléphones, w les sites bach ykhdmo..."
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "1. Les Centres de Données (Data Centers)",
      icon: Server,
      content: (
        <div className="space-y-4">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={dataCenterEnergyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis yAxisId="left" label={{ value: 'TWh', angle: -90, position: 'insideLeft' }} />
              <YAxis yAxisId="right" orientation="right" label={{ value: 'Mt CO₂', angle: 90, position: 'insideRight' }} />
              <Tooltip />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="consumption" stroke="#3b82f6" strokeWidth={3} name="Consommation électrique" />
              <Line yAxisId="right" type="monotone" dataKey="co2" stroke="#ef4444" strokeWidth={3} name="Émissions CO₂" />
            </LineChart>
          </ResponsiveContainer>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded">
              <h3 className="font-bold text-blue-900 mb-2">📊 Chiffres clés</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• 1-2% de l'électricité mondiale (AIE)</li>
                <li>• +30% croissance en 5 ans</li>
                <li>• Refroidissement = 40% de l'énergie</li>
                <li>• Hébergent milliards de sites web</li>
              </ul>
            </div>
            
            <div className="grid grid-rows-2 gap-2">
              <div className="bg-green-50 p-2 rounded">
                <p className="font-bold text-green-900 text-sm mb-1">✓ Avantages</p>
                <ul className="text-xs text-green-800">
                  <li>• Centralisation efficace</li>
                  <li>• Économies d'échelle</li>
                </ul>
              </div>
              <div className="bg-red-50 p-2 rounded">
                <p className="font-bold text-red-900 text-sm mb-1">✗ Inconvénients</p>
                <ul className="text-xs text-red-800">
                  <li>• Consommation massive</li>
                  <li>• Chaleur excessive</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-3 rounded">
            <p className="text-sm text-yellow-900">
              <strong>Impact:</strong> Un data center moyen consomme autant qu'une ville de 50 000 habitants
            </p>
          </div>
        </div>
      )
    },
    {
      title: "2. Les Équipements Informatiques",
      icon: Cpu,
      content: (
        <div className="space-y-4">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={equipmentConsumptionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="device" />
              <YAxis yAxisId="left" label={{ value: 'TWh/an', angle: -90, position: 'insideLeft' }} />
              <YAxis yAxisId="right" orientation="right" label={{ value: 'Croissance %', angle: 90, position: 'insideRight' }} />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="consumption" fill="#3b82f6" name="Consommation" />
              <Bar yAxisId="right" dataKey="growth" fill="#10b981" name="Croissance annuelle" />
            </BarChart>
          </ResponsiveContainer>
          
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-purple-50 p-3 rounded">
              <h4 className="font-bold text-purple-900 text-sm mb-2">⚡ Puissance</h4>
              <p className="text-xs text-purple-800">Plus l'appareil est puissant, plus il consomme d'énergie</p>
            </div>
            
            <div className="bg-orange-50 p-3 rounded">
              <h4 className="font-bold text-orange-900 text-sm mb-2">🔄 Obsolescence</h4>
              <p className="text-xs text-orange-800">Renouvellement rapide = production constante</p>
            </div>
            
            <div className="bg-pink-50 p-3 rounded">
              <h4 className="font-bold text-pink-900 text-sm mb-2">📱 IoT</h4>
              <p className="text-xs text-pink-800">Croissance explosive: +35%/an</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-50 border-l-4 border-green-500 p-3 rounded">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <h3 className="font-bold text-green-900">Avantages</h3>
              </div>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Productivité accrue</li>
                <li>• Innovation technologique</li>
                <li>• Connectivité mondiale</li>
              </ul>
            </div>
            
            <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="w-5 h-5 text-red-600" />
                <h3 className="font-bold text-red-900">Inconvénients</h3>
              </div>
              <ul className="text-sm text-red-800 space-y-1">
                <li>• Consommation 24/7</li>
                <li>• E-déchets massifs</li>
                <li>• Extraction de métaux rares</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "3. Le Stockage et le Cloud",
      icon: Cloud,
      content: (
        <div className="space-y-4">
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={cloudStorageData}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={({ category, value }) => `${category}: ${value}%`}
                outerRadius={90}
                fill="#8884d8"
                dataKey="value"
              >
                {cloudStorageData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-blue-100 p-2 rounded">
              <p className="text-2xl font-bold text-blue-900">319</p>
              <p className="text-xs text-blue-700">Milliards d'emails/jour</p>
            </div>
            <div className="bg-green-100 p-2 rounded">
              <p className="text-2xl font-bold text-green-900">4.5</p>
              <p className="text-xs text-green-700">g CO₂ par email</p>
            </div>
            <div className="bg-purple-100 p-2 rounded">
              <p className="text-2xl font-bold text-purple-900">50</p>
              <p className="text-xs text-purple-700">g CO₂ avec PJ lourde</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-50 border-l-4 border-green-500 p-3 rounded">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <h3 className="font-bold text-green-900">Avantages</h3>
              </div>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Accessibilité partout</li>
                <li>• Sauvegardes automatiques</li>
                <li>• Partage facilité</li>
                <li>• Pas d'achat de disques</li>
              </ul>
            </div>
            
            <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="w-5 h-5 text-red-600" />
                <h3 className="font-bold text-red-900">Inconvénients</h3>
              </div>
              <ul className="text-sm text-red-800 space-y-1">
                <li>• Coût énergétique caché</li>
                <li>• Serveurs physiques requis</li>
                <li>• Stockage inutile massif</li>
                <li>• Émissions CO₂ continues</li>
              </ul>
            </div>
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-2 rounded">
            <p className="text-sm text-blue-900">
              💡 <strong>Réalité:</strong> Le cloud n'est pas "immatériel" - chaque donnée existe physiquement sur un serveur
            </p>
          </div>
        </div>
      )
    },
    {
      title: "4. Le Streaming et les Usages Intensifs",
      icon: Video,
      content: (
        <div className="space-y-4">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={streamingImpactData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="quality" angle={-15} textAnchor="end" height={60} style={{fontSize: '11px'}} />
              <YAxis yAxisId="left" label={{ value: 'GB/h', angle: -90, position: 'insideLeft' }} />
              <YAxis yAxisId="right" orientation="right" label={{ value: 'kWh/h', angle: 90, position: 'insideRight' }} />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="bandwidth" fill="#8b5cf6" name="Bande passante" />
              <Bar yAxisId="right" dataKey="energy" fill="#ef4444" name="Énergie" />
            </BarChart>
          </ResponsiveContainer>

          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-3 rounded-lg border-2 border-purple-200">
            <h3 className="font-bold text-purple-900 mb-2">📺 Le streaming vidéo = 60% du trafic Internet mondial</h3>
            <div className="grid grid-cols-3 gap-2 mt-2">
              <div className="text-center">
                <p className="text-lg font-bold text-purple-900">Netflix</p>
                <p className="text-xs text-purple-700">+200M abonnés</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-red-900">YouTube</p>
                <p className="text-xs text-red-700">1Md h/jour</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-blue-900">Gaming</p>
                <p className="text-xs text-blue-700">15% trafic</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-50 border-l-4 border-green-500 p-3 rounded">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <h3 className="font-bold text-green-900">Avantages</h3>
              </div>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Divertissement illimité</li>
                <li>• Éducation en ligne</li>
                <li>• Pas de support physique</li>
                <li>• Accès instantané</li>
              </ul>
            </div>
            
            <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="w-5 h-5 text-red-600" />
                <h3 className="font-bold text-red-900">Inconvénients</h3>
              </div>
              <ul className="text-sm text-red-800 space-y-1">
                <li>• HD/4K = 15x plus d'énergie</li>
                <li>• Bande passante saturée</li>
                <li>• 300Mt CO₂/an (streaming)</li>
                <li>• Consommation continue</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Répartition du Trafic Internet Global",
      content: (
        <div className="space-y-4">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={internetTrafficData}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={({ service, percentage }) => `${service}: ${percentage}%`}
                outerRadius={110}
                fill="#8884d8"
                dataKey="percentage"
              >
                {internetTrafficData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-purple-50 p-3 rounded">
              <h4 className="font-bold text-purple-900 mb-2">🎬 Streaming Vidéo (60%)</h4>
              <p className="text-sm text-purple-800">Netflix, YouTube, Disney+ - Plus grande part du trafic</p>
            </div>
            
            <div className="bg-blue-50 p-3 rounded">
              <h4 className="font-bold text-blue-900 mb-2">🎮 Gaming (15%)</h4>
              <p className="text-sm text-blue-800">Cloud gaming, téléchargements, streaming Twitch</p>
            </div>
            
            <div className="bg-pink-50 p-3 rounded">
              <h4 className="font-bold text-pink-900 mb-2">📱 Réseaux Sociaux (12%)</h4>
              <p className="text-sm text-pink-800">Facebook, Instagram, TikTok - Vidéos courtes</p>
            </div>
            
            <div className="bg-green-50 p-3 rounded">
              <h4 className="font-bold text-green-900 mb-2">📧 Email/Web (8%)</h4>
              <p className="text-sm text-green-800">Navigation classique, emails, actualités</p>
            </div>
          </div>

          <div className="bg-red-50 border-2 border-red-300 p-3 rounded-lg">
            <p className="font-bold text-red-900 mb-1">⚠️ Impact Environnemental</p>
            <p className="text-sm text-red-800">
              La qualité vidéo influence drastiquement : 1h en 4K = 6h en SD
            </p>
          </div>
        </div>
      )
    },
    {
      title: "5. Solutions et Optimisation Verte",
      icon: Leaf,
      content: (
        <div className="space-y-4">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={greenSolutionsData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" label={{ value: 'Réduction %', position: 'bottom' }} />
              <YAxis type="category" dataKey="solution" width={150} style={{fontSize: '11px'}} />
              <Tooltip />
              <Bar dataKey="impact" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-green-50 p-3 rounded border-2 border-green-300">
              <h4 className="font-bold text-green-900 text-sm mb-2">🌱 Énergies Renouvelables</h4>
              <p className="text-xs text-green-800">Google, Apple, Microsoft: 100% renouvelable</p>
              <p className="text-xs text-green-700 mt-1">✓ -85% émissions</p>
            </div>
            
            <div className="bg-blue-50 p-3 rounded border-2 border-blue-300">
              <h4 className="font-bold text-blue-900 text-sm mb-2">❄️ Refroidissement Optimisé</h4>
              <p className="text-xs text-blue-800">Refroidissement liquide, AI, free-cooling</p>
              <p className="text-xs text-blue-700 mt-1">✓ -40% énergie</p>
            </div>
            
            <div className="bg-purple-50 p-3 rounded border-2 border-purple-300">
              <h4 className="font-bold text-purple-900 text-sm mb-2">☁️ Virtualisation</h4>
              <p className="text-xs text-purple-800">Plusieurs VM sur 1 serveur physique</p>
              <p className="text-xs text-purple-700 mt-1">✓ -60% serveurs</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-50 border-l-4 border-green-500 p-3 rounded">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <h3 className="font-bold text-green-900">Avantages Solutions Vertes</h3>
              </div>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Réduction drastique CO₂</li>
                <li>• Économies à long terme</li>
                <li>• Image positive entreprise</li>
                <li>• Conformité réglementaire</li>
              </ul>
            </div>
            
            <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="w-5 h-5 text-red-600" />
                <h3 className="font-bold text-red-900">Inconvénients</h3>
              </div>
              <ul className="text-sm text-red-800 space-y-1">
                <li>• Investissement initial élevé</li>
                <li>• Migration complexe</li>
                <li>• Disponibilité variable (solaire)</li>
                <li>• Expertise technique requise</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Comportements Numériques Responsables",
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="bg-green-100 border-2 border-green-400 p-3 rounded-lg">
                <h3 className="font-bold text-green-900 mb-2">✓ BONNES PRATIQUES</h3>
                <ul className="text-sm text-green-800 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">📧</span>
                    <span>Nettoyer régulièrement les emails</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">💾</span>
                    <span>Supprimer les fichiers inutiles du cloud</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">📺</span>
                    <span>Réduire la qualité de streaming (HD au lieu de 4K)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">🔌</span>
                    <span>Éteindre les appareils inutilisés</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">📱</span>
                    <span>Prolonger la durée de vie des appareils</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">🔍</span>
                    <span>Utiliser des moteurs de recherche éco-responsables</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="space-y-3">
              <div className="bg-red-100 border-2 border-red-400 p-3 rounded-lg">
                <h3 className="font-bold text-red-900 mb-2">✗ À ÉVITER</h3>
                <ul className="text-sm text-red-800 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 font-bold">❌</span>
                    <span>Laisser les appareils en veille constante</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 font-bold">❌</span>
                    <span>Stocker des doublons et fichiers oubliés</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 font-bold">❌</span>
                    <span>Toujours streamer en qualité maximale</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 font-bold">❌</span>
                    <span>Changer d'appareil tous les ans</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 font-bold">❌</span>
                    <span>Multiplier les comptes cloud</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 font-bold">❌</span>
                    <span>Envoyer des emails avec PJ lourdes inutiles</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-blue-50 p-3 rounded text-center">
              <p className="text-3xl font-bold text-blue-900">30%</p>
              <p className="text-sm text-blue-700">Réduction possible par utilisateur</p>
            </div>
            <div className="bg-green-50 p-3 rounded text-center">
              <p className="text-3xl font-bold text-green-900">700kg</p>
              <p className="text-sm text-green-700">CO₂ économisé/an/personne</p>
            </div>
            <div className="bg-purple-50 p-3 rounded text-center">
              <p className="text-3xl font-bold text-purple-900">€150</p>
              <p className="text-sm text-purple-700">Économie d'énergie/an</p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-orange-500 p-4 rounded-lg">
            <p className="font-bold text-orange-900 mb-2">💡 Point Clé</p>
            <p className="text-orange-800">
              Chaque geste compte : la somme des petites actions individuelles crée un impact collectif majeur sur l'environnement
            </p>
          </div>
        </div>
      )
    },
    {
      title: "Conclusion Générale : Cyber-Consommation",
      content: (
        <div className="space-y-5">
          <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 p-5 rounded-lg border-2 border-blue-300">
            <h3 className="text-2xl font-bold text-gray-900 mb-3 text-center">Synthèse Complète</h3>
            <p className="text-gray-800 text-center">
              La consommation des ressources informatiques a deux visages : la cybersécurité et l'usage quotidien, 
              tous deux avec un impact environnemental significatif
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white border-2 border-blue-400 p-4 rounded-lg">
              <h4 className="font-bold text-blue-900 mb-3 text-lg">🛡️ Cybersécurité</h4>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>• Outils de protection = 15-60% CPU</li>
                <li>• Coûts élevés mais nécessaires</li>
                <li>• Attaques = surcharge massive</li>
                <li>• Balance: sécurité vs performance</li>
              </ul>
            </div>
            
            <div className="bg-white border-2 border-green-400 p-4 rounded-lg">
              <h4 className="font-bold text-green-900 mb-3 text-lg">🌍 Impact Environnemental</h4>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>• Data centers = 1-2% électricité mondiale</li>
                <li>• Streaming = 60% du trafic Internet</li>
                <li>• Cloud "invisible" mais réel</li>
                <li>• Solutions vertes possibles</li>
              </ul>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-100 to-blue-100 p-4 rounded-lg border-2 border-green-400">
            <h4 className="font-bold text-gray-900 mb-3">🎯 Recommandations Finales</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-semibold text-green-900 mb-2">Pour les entreprises:</p>
                <ul className="text-sm text-gray-800 space-y-1">
                  <li>✓ Investir dans le vert</li>
                  <li>✓ Optimiser les infrastructures</li>
                  <li>✓ Former les équipes</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-blue-900 mb-2">Pour les utilisateurs:</p>
                <ul className="text-sm text-gray-800 space-y-1">
                  <li>✓ Adopter l'éco-usage</li>
                  <li>✓ Nettoyer régulièrement</li>
                  <li>✓ Prolonger la durée de vie</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
            <p className="font-bold text-yellow-900 mb-2">💭 Réflexion Finale</p>
            <p className="text-yellow-800 text-sm italic">
              "Lconsommation dyal ressources informatiques hya invisible mais réelle. Kif tfrrej f vidéo, 
              tstocki f cloud, ola t3mel recherche — koul wa7da 3andha thaman f l'électricité w f l'environnement. 
              Mais b les bonnes pratiques, on peut réduire cet impact sans sacrifier nos besoins digitaux."
            </p>
          </div>

          <div className="text-center bg-gradient-to-r from-purple-100 to-pink-100 p-5 rounded-lg">
            <p className="text-2xl font-bold text-gray-900">🌱 Ensemble pour un numérique durable</p>
            <p className="text-gray-700 mt-2">Merci pour votre attention</p>
          </div>
        </div>
      )
    }
  ];

  const currentSlide = slides[activeSlide];
  const Icon = currentSlide.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          {Icon && <Icon className="w-16 h-16 mx-auto mb-4 text-blue-400" />}
          <h1 className="text-4xl font-bold mb-2">{currentSlide.title}</h1>
          {currentSlide.subtitle && (
            <p className="text-xl text-blue-300">{currentSlide.subtitle}</p>
          )}
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-2xl p-8 text-gray-800 min-h-[550px]">
          {currentSlide.content}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-8">
          <button
            onClick={() => setActiveSlide(Math.max(0, activeSlide - 1))}
            disabled={activeSlide === 0}
            className="px-6 py-3 bg-blue-600 rounded-lg disabled:bg-gray-600 disabled:cursor-not-allowed hover:bg-blue-700 transition"
          >
            ← Précédent
          </button>
          
          <div className="flex gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveSlide(index)}
                className={`w-3 h-3 rounded-full transition ${
                  index === activeSlide ? 'bg-blue-400 w-8' : 'bg-gray-500'
                }`}
              />
            ))}
          </div>
          
          <button
            onClick={() => setActiveSlide(Math.min(slides.length - 1, activeSlide + 1))}
            disabled={activeSlide === slides.length - 1}
            className="px-6 py-3 bg-blue-600 rounded-lg disabled:bg-gray-600 disabled:cursor-not-allowed hover:bg-blue-700 transition"
          >
            Suivant →
          </button>
        </div>

        {/* Slide counter */}
        <div className="text-center mt-4 text-blue-300">
          Slide {activeSlide + 1} / {slides.length}
        </div>
      </div>
    </div>
  );
};

export default CyberConsumptionPresentation;

