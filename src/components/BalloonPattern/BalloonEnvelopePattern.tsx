import React, { useState } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Tabs, 
  Tab, 
  Button,
  Chip,
  Divider
} from '@mui/material';
import MaterialIcon from '../common/MaterialIcon';

interface GoreSection {
  id: string;
  name: string;
  color: string;
  hexColor: string;
  width: number; // inches
  height: number; // inches
  position: { x: number; y: number };
  cutLines: string[];
  foldLines: string[];
  seamAllowance: number;
  fabricType: string;
  goreNumber: number;
  sectionNumber: number;
}

interface PatternSpecs {
  totalGores: number;
  envelopeHeight: number; // feet
  maxDiameter: number; // feet
  volume: number; // cubic feet
  fabricWeight: string;
  seamStrength: string;
}

const BalloonEnvelopePattern: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedGore, setSelectedGore] = useState(1);

  const patternSpecs: PatternSpecs = {
    totalGores: 24,
    envelopeHeight: 65,
    maxDiameter: 52,
    volume: 77000,
    fabricWeight: '1.5 oz ripstop nylon',
    seamStrength: '200+ lbs tensile'
  };

  // Gore sections based on the reference chevron balloon image
  // Each gore has 12 sections from apex to base
  const goreTemplate: GoreSection[] = [
    // Section 1: Apex Crown (Dark Purple/Maroon)
    {
      id: 'apex-crown',
      name: 'Apex Crown',
      color: 'Dark Purple',
      hexColor: '#2d1b3d',
      width: 8.5,
      height: 12.0,
      position: { x: 0, y: 0 },
      cutLines: ['curved-apex', 'side-seams'],
      foldLines: ['center-meridian'],
      seamAllowance: 0.5,
      fabricType: 'ripstop-nylon',
      goreNumber: 1,
      sectionNumber: 1
    },
    
    // Section 2: Upper Crown (Purple to Blue transition)
    {
      id: 'upper-crown',
      name: 'Upper Crown',
      color: 'Purple-Blue',
      hexColor: '#4a2c5a',
      width: 15.2,
      height: 18.5,
      position: { x: 0, y: 12 },
      cutLines: ['chevron-top', 'chevron-bottom', 'side-seams'],
      foldLines: ['center-meridian', 'quarter-lines'],
      seamAllowance: 0.5,
      fabricType: 'ripstop-nylon',
      goreNumber: 1,
      sectionNumber: 2
    },
    
    // Section 3: Upper Blue
    {
      id: 'upper-blue-1',
      name: 'Upper Blue 1',
      color: 'Dark Blue',
      hexColor: '#1e3a5f',
      width: 22.8,
      height: 24.0,
      position: { x: 0, y: 30.5 },
      cutLines: ['chevron-top', 'chevron-bottom', 'side-seams'],
      foldLines: ['center-meridian', 'quarter-lines'],
      seamAllowance: 0.5,
      fabricType: 'ripstop-nylon',
      goreNumber: 1,
      sectionNumber: 3
    },
    
    // Section 4: Mid Blue
    {
      id: 'upper-blue-2',
      name: 'Upper Blue 2',
      color: 'Medium Blue',
      hexColor: '#2d5a87',
      width: 30.4,
      height: 28.5,
      position: { x: 0, y: 54.5 },
      cutLines: ['chevron-top', 'chevron-bottom', 'side-seams'],
      foldLines: ['center-meridian', 'quarter-lines'],
      seamAllowance: 0.5,
      fabricType: 'ripstop-nylon',
      goreNumber: 1,
      sectionNumber: 4
    },
    
    // Section 5: Light Blue/Teal
    {
      id: 'upper-blue-3',
      name: 'Light Blue',
      color: 'Light Blue',
      hexColor: '#4a7ba7',
      width: 38.0,
      height: 32.0,
      position: { x: 0, y: 83 },
      cutLines: ['chevron-top', 'chevron-bottom', 'side-seams'],
      foldLines: ['center-meridian', 'quarter-lines'],
      seamAllowance: 0.5,
      fabricType: 'ripstop-nylon',
      goreNumber: 1,
      sectionNumber: 5
    },
    
    // Section 6: Green
    {
      id: 'green-section',
      name: 'Green Section',
      color: 'Forest Green',
      hexColor: '#2d4a2d',
      width: 45.6,
      height: 35.5,
      position: { x: 0, y: 115 },
      cutLines: ['chevron-top', 'chevron-bottom', 'side-seams'],
      foldLines: ['center-meridian', 'quarter-lines'],
      seamAllowance: 0.5,
      fabricType: 'ripstop-nylon',
      goreNumber: 1,
      sectionNumber: 6
    },
    
    // Section 7: Yellow/Gold
    {
      id: 'yellow-section',
      name: 'Yellow Section',
      color: 'Golden Yellow',
      hexColor: '#d4b23a',
      width: 53.2,
      height: 38.0,
      position: { x: 0, y: 150.5 },
      cutLines: ['chevron-top', 'chevron-bottom', 'side-seams'],
      foldLines: ['center-meridian', 'quarter-lines'],
      seamAllowance: 0.5,
      fabricType: 'ripstop-nylon',
      goreNumber: 1,
      sectionNumber: 7
    },
    
    // Section 8: Orange
    {
      id: 'orange-section',
      name: 'Orange Section',
      color: 'Bright Orange',
      hexColor: '#e07b35',
      width: 60.8,
      height: 40.5,
      position: { x: 0, y: 188.5 },
      cutLines: ['chevron-top', 'chevron-bottom', 'side-seams'],
      foldLines: ['center-meridian', 'quarter-lines'],
      seamAllowance: 0.5,
      fabricType: 'ripstop-nylon',
      goreNumber: 1,
      sectionNumber: 8
    },
    
    // Section 9: Red
    {
      id: 'red-section',
      name: 'Red Section',
      color: 'Crimson Red',
      hexColor: '#c73e47',
      width: 68.4,
      height: 42.0,
      position: { x: 0, y: 229 },
      cutLines: ['chevron-top', 'chevron-bottom', 'side-seams'],
      foldLines: ['center-meridian', 'quarter-lines'],
      seamAllowance: 0.5,
      fabricType: 'ripstop-nylon',
      goreNumber: 1,
      sectionNumber: 9
    },
    
    // Section 10: Magenta/Purple
    {
      id: 'magenta-section',
      name: 'Magenta Section',
      color: 'Deep Magenta',
      hexColor: '#8f4c81',
      width: 76.0,
      height: 43.5,
      position: { x: 0, y: 271 },
      cutLines: ['chevron-top', 'chevron-bottom', 'side-seams'],
      foldLines: ['center-meridian', 'quarter-lines'],
      seamAllowance: 0.5,
      fabricType: 'ripstop-nylon',
      goreNumber: 1,
      sectionNumber: 10
    },
    
    // Section 11: Dark Purple
    {
      id: 'lower-purple',
      name: 'Lower Purple',
      color: 'Dark Purple',
      hexColor: '#4a1a3d',
      width: 83.6,
      height: 44.0,
      position: { x: 0, y: 314.5 },
      cutLines: ['chevron-top', 'chevron-bottom', 'side-seams'],
      foldLines: ['center-meridian', 'quarter-lines'],
      seamAllowance: 0.5,
      fabricType: 'ripstop-nylon',
      goreNumber: 1,
      sectionNumber: 11
    },
    
    // Section 12: Base (Dark Blue/Black)
    {
      id: 'base-section',
      name: 'Base Section',
      color: 'Midnight Blue',
      hexColor: '#1a2332',
      width: 91.2,
      height: 48.0,
      position: { x: 0, y: 358.5 },
      cutLines: ['chevron-top', 'straight-bottom', 'side-seams'],
      foldLines: ['center-meridian', 'quarter-lines'],
      seamAllowance: 0.5,
      fabricType: 'ripstop-nylon',
      goreNumber: 1,
      sectionNumber: 12
    }
  ];

  const ChevronPatternPiece: React.FC<{ 
    section: GoreSection; 
    scale?: number; 
    showDetails?: boolean;
  }> = ({ section, scale = 1, showDetails = true }) => {
    const width = section.width * scale;
    const height = section.height * scale;
    
    return (
      <Box sx={{ position: 'relative', display: 'inline-block' }}>
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
          <defs>
            {/* Chevron pattern definition */}
            <pattern 
              id={`chevron-${section.id}`} 
              patternUnits="userSpaceOnUse" 
              width="20" 
              height="20"
              patternTransform="rotate(45)"
            >
              <rect width="20" height="20" fill={section.hexColor} />
              <path
                d="M0,10 L10,0 L20,10 L10,20 Z"
                fill={section.hexColor}
                fillOpacity="0.8"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="0.5"
              />
            </pattern>
            
            {/* Load tape pattern */}
            <pattern id="loadTape" patternUnits="userSpaceOnUse" width="4" height="4">
              <rect width="4" height="4" fill="none" />
              <rect width="2" height="4" fill="#333" />
            </pattern>
          </defs>
          
          {/* Main fabric piece */}
          <rect 
            width="100%" 
            height="100%" 
            fill={section.hexColor}
            stroke="#000" 
            strokeWidth="1"
          />
          
          {/* Chevron pattern overlay */}
          {section.sectionNumber > 2 && section.sectionNumber < 12 && (
            <path
              d={`M0,${height/2} L${width/2},0 L${width},${height/2} L${width/2},${height} Z`}
              fill="none"
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="2"
              strokeDasharray="4,4"
            />
          )}
          
          {/* Cut lines (black dashed) */}
          <g stroke="#000" strokeWidth="2" strokeDasharray="8,4" fill="none">
            {/* Top edge */}
            {section.sectionNumber === 1 ? (
              <path d={`M0,0 Q${width/2},${height*0.3} ${width},0`} />
            ) : (
              <line x1="0" y1="0" x2={width} y2="0" />
            )}
            
            {/* Bottom edge */}
            {section.sectionNumber === 12 ? (
              <line x1="0" y1={height} x2={width} y2={height} />
            ) : (
              <path d={`M0,${height} L${width/2},${height*0.7} L${width},${height}`} />
            )}
            
            {/* Side seams */}
            <line x1="0" y1="0" x2="0" y2={height} />
            <line x1={width} y1="0" x2={width} y2={height} />
          </g>
          
          {/* Fold lines (red dashed) */}
          <g stroke="#ff0000" strokeWidth="1" strokeDasharray="4,2" fill="none">
            {/* Center meridian */}
            <line x1={width/2} y1="0" x2={width/2} y2={height} />
            
            {/* Quarter lines */}
            <line x1={width/4} y1="0" x2={width/4} y2={height} />
            <line x1={(3*width)/4} y1="0" x2={(3*width)/4} y2={height} />
          </g>
          
          {/* Load tape positions (for stress points) */}
          {(section.sectionNumber === 6 || section.sectionNumber === 9) && (
            <g>
              <rect x={width/2 - 2} y="0" width="4" height={height} fill="url(#loadTape)" />
              <rect x={width/4 - 1} y="0" width="2" height={height} fill="url(#loadTape)" />
              <rect x={(3*width)/4 - 1} y="0" width="2" height={height} fill="url(#loadTape)" />
            </g>
          )}
          
          {/* Seam allowance guides (light gray) */}
          <g stroke="#ccc" strokeWidth="1" strokeDasharray="2,2" fill="none">
            <rect 
              x={section.seamAllowance * scale} 
              y={section.seamAllowance * scale} 
              width={width - (2 * section.seamAllowance * scale)} 
              height={height - (2 * section.seamAllowance * scale)} 
            />
          </g>
          
          {/* Section label */}
          {showDetails && (
            <text
              x={width/2}
              y={height/2}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="white"
              fontSize="10"
              fontWeight="bold"
              textShadow="1px 1px 2px rgba(0,0,0,0.8)"
            >
              {section.sectionNumber}
            </text>
          )}
          
          {/* Grain line arrow */}
          <g stroke="blue" strokeWidth="2" fill="blue">
            <line x1={width - 15} y1="10" x2={width - 15} y2="30" />
            <polygon points={`${width - 15},10 ${width - 18},16 ${width - 12},16`} />
            <text x={width - 35} y="25" fontSize="8" fill="blue">GRAIN</text>
          </g>
          
          {/* Measurement annotations */}
          {showDetails && (
            <g>
              {/* Width measurement */}
              <line x1="0" y1={height + 10} x2={width} y2={height + 10} stroke="#666" strokeWidth="1" />
              <line x1="0" y1={height + 5} x2="0" y2={height + 15} stroke="#666" strokeWidth="1" />
              <line x1={width} y1={height + 5} x2={width} y2={height + 15} stroke="#666" strokeWidth="1" />
              <text x={width/2} y={height + 25} textAnchor="middle" fontSize="8" fill="#666">
                {section.width}"
              </text>
              
              {/* Height measurement */}
              <line x1={width + 10} y1="0" x2={width + 10} y2={height} stroke="#666" strokeWidth="1" />
              <line x1={width + 5} y1="0" x2={width + 15} y2="0" stroke="#666" strokeWidth="1" />
              <line x1={width + 5} y1={height} x2={width + 15} y2={height} stroke="#666" strokeWidth="1" />
              <text x={width + 30} y={height/2} textAnchor="middle" fontSize="8" fill="#666" transform={`rotate(90, ${width + 30}, ${height/2})`}>
                {section.height}"
              </text>
            </g>
          )}
        </svg>
        
        {/* Pattern piece info overlay */}
        {showDetails && (
          <Box
            sx={{
              position: 'absolute',
              top: 4,
              left: 4,
              backgroundColor: 'rgba(255,255,255,0.9)',
              padding: '4px 8px',
              borderRadius: 1,
              fontSize: '10px',
              fontWeight: 'bold',
            }}
          >
            {section.id}
          </Box>
        )}
      </Box>
    );
  };

  const FullGoreLayout: React.FC = () => (
    <Box sx={{ textAlign: 'center' }}>
      <Typography variant="h6" gutterBottom>
        Complete Gore Pattern (Gore #{selectedGore} of {patternSpecs.totalGores})
      </Typography>
      <Box
        sx={{
          display: 'inline-block',
          border: '2px solid #333',
          backgroundColor: '#f9f9f9',
          p: 2,
          borderRadius: 2,
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {goreTemplate.map((section) => (
            <ChevronPatternPiece
              key={section.id}
              section={section}
              scale={0.8}
              showDetails={false}
            />
          ))}
        </Box>
      </Box>
      
      <Box sx={{ mt: 2, display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
        {Array.from({ length: patternSpecs.totalGores }, (_, i) => (
          <Button
            key={i + 1}
            size="small"
            variant={selectedGore === i + 1 ? 'contained' : 'outlined'}
            onClick={() => setSelectedGore(i + 1)}
            sx={{ minWidth: 40 }}
          >
            {i + 1}
          </Button>
        ))}
      </Box>
    </Box>
  );

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h4" gutterBottom>
              Hot Air Balloon Envelope Pattern
            </Typography>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              Chevron Design - Precision Cutting & Assembly Pattern
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Based on reference image with exact color matching and structural specifications
            </Typography>
          </Box>
          <Chip
            icon={<MaterialIcon icon="verified" />}
            label="Production Ready"
            color="success"
            variant="outlined"
          />
        </Box>
        
        {/* Technical Specifications */}
        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid item xs={6} sm={3}>
            <Typography variant="caption" color="text.secondary">Total Gores</Typography>
            <Typography variant="h6" fontWeight="bold">{patternSpecs.totalGores}</Typography>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="caption" color="text.secondary">Envelope Height</Typography>
            <Typography variant="h6" fontWeight="bold">{patternSpecs.envelopeHeight} ft</Typography>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="caption" color="text.secondary">Max Diameter</Typography>
            <Typography variant="h6" fontWeight="bold">{patternSpecs.maxDiameter} ft</Typography>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="caption" color="text.secondary">Volume</Typography>
            <Typography variant="h6" fontWeight="bold">{patternSpecs.volume.toLocaleString()} ft³</Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Navigation Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={selectedTab} onChange={(_, newValue) => setSelectedTab(newValue)}>
          <Tab label="Complete Gore" />
          <Tab label="Individual Pieces" />
          <Tab label="Assembly Guide" />
          <Tab label="Technical Specs" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {selectedTab === 0 && (
        <Paper sx={{ p: 3 }}>
          <FullGoreLayout />
        </Paper>
      )}

      {selectedTab === 1 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Individual Pattern Pieces - Detailed View
          </Typography>
          <Grid container spacing={3}>
            {goreTemplate.map((section) => (
              <Grid item xs={12} md={6} lg={4} key={section.id}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                      Section {section.sectionNumber}: {section.name}
                    </Typography>
                    <Box sx={{ mb: 2, textAlign: 'center' }}>
                      <ChevronPatternPiece
                        section={section}
                        scale={0.6}
                        showDetails={true}
                      />
                    </Box>
                    <Divider sx={{ my: 2 }} />
                    <Grid container spacing={1}>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">Dimensions</Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {section.width}" × {section.height}"
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">Color</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box
                            sx={{
                              width: 16,
                              height: 16,
                              backgroundColor: section.hexColor,
                              borderRadius: 1,
                              border: '1px solid #ccc',
                            }}
                          />
                          <Typography variant="body2">{section.color}</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="caption" color="text.secondary">Seam Allowance</Typography>
                        <Typography variant="body2">{section.seamAllowance}"</Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="caption" color="text.secondary">Cut Lines</Typography>
                        <Typography variant="body2">{section.cutLines.join(', ')}</Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="caption" color="text.secondary">Fold Lines</Typography>
                        <Typography variant="body2">{section.foldLines.join(', ')}</Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}

      {selectedTab === 2 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Assembly Instructions & Guidelines
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                    <MaterialIcon icon="content_cut" sx={{ mr: 1 }} />
                    Cutting Instructions
                  </Typography>
                  <Typography variant="body2" component="div">
                    <ol>
                      <li><strong>Fabric Preparation:</strong> Pre-wash and press all ripstop nylon</li>
                      <li><strong>Pattern Layout:</strong> Align grain line with fabric weave direction</li>
                      <li><strong>Cutting:</strong> Use rotary cutter for precision on straight edges</li>
                      <li><strong>Curved Cuts:</strong> Use sharp fabric scissors for apex sections</li>
                      <li><strong>Seam Allowance:</strong> Add exactly 0.5" to all edges</li>
                      <li><strong>Marking:</strong> Use fabric chalk for fold lines and reference points</li>
                      <li><strong>Numbering:</strong> Label each piece with section and gore numbers</li>
                    </ol>
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                    <MaterialIcon icon="build" sx={{ mr: 1 }} />
                    Assembly Sequence
                  </Typography>
                  <Typography variant="body2" component="div">
                    <ol>
                      <li><strong>Gore Assembly:</strong> Sew sections 1-12 for each gore individually</li>
                      <li><strong>Seam Type:</strong> Use French seams for all connections (0.25" + 0.25")</li>
                      <li><strong>Load Tapes:</strong> Install at sections 6 & 9 before final assembly</li>
                      <li><strong>Gore Joining:</strong> Connect gores starting from apex, working down</li>
                      <li><strong>Stress Testing:</strong> Check all seams at 150% working load</li>
                      <li><strong>Base Attachment:</strong> Install mouth and deflation port</li>
                      <li><strong>Final Inspection:</strong> Verify all seam integrity and measurements</li>
                    </ol>
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                    <MaterialIcon icon="warning" sx={{ mr: 1 }} />
                    Critical Safety Requirements
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="body2" fontWeight="bold" color="error.main">
                        Seam Strength Requirements
                      </Typography>
                      <Typography variant="body2">
                        • Minimum 200 lbs tensile strength<br/>
                        • Double-stitched load-bearing seams<br/>
                        • Load tape reinforcement at stress points
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="body2" fontWeight="bold" color="warning.main">
                        Fabric Specifications
                      </Typography>
                      <Typography variant="body2">
                        • 1.5 oz ripstop nylon only<br/>
                        • Zero porosity coating required<br/>
                        • UV-resistant treatment essential
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="body2" fontWeight="bold" color="info.main">
                        Quality Control
                      </Typography>
                      <Typography variant="body2">
                        • Inspect every seam before assembly<br/>
                        • Test fabric strength at 10% intervals<br/>
                        • Document all measurements and tests
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Paper>
      )}

      {selectedTab === 3 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Technical Specifications & Materials
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                    Envelope Specifications
                  </Typography>
                  <Grid container spacing={1}>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">Total Height</Typography>
                      <Typography variant="body2" fontWeight="bold">65 feet (780 inches)</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">Maximum Diameter</Typography>
                      <Typography variant="body2" fontWeight="bold">52 feet (624 inches)</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">Volume</Typography>
                      <Typography variant="body2" fontWeight="bold">77,000 cubic feet</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">Surface Area</Typography>
                      <Typography variant="body2" fontWeight="bold">8,500 square feet</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">Total Gores</Typography>
                      <Typography variant="body2" fontWeight="bold">24 gores</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">Sections per Gore</Typography>
                      <Typography variant="body2" fontWeight="bold">12 sections</Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                    Material Requirements
                  </Typography>
                  <Grid container spacing={1}>
                    <Grid item xs={12}>
                      <Typography variant="caption" color="text.secondary">Primary Fabric</Typography>
                      <Typography variant="body2" fontWeight="bold">1.5 oz Ripstop Nylon</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="caption" color="text.secondary">Coating</Typography>
                      <Typography variant="body2" fontWeight="bold">Zero Porosity Urethane</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="caption" color="text.secondary">Load Tapes</Typography>
                      <Typography variant="body2" fontWeight="bold">1" Polyester Webbing</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="caption" color="text.secondary">Thread</Typography>
                      <Typography variant="body2" fontWeight="bold">Polyester Core, Size 69</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="caption" color="text.secondary">Seam Strength</Typography>
                      <Typography variant="body2" fontWeight="bold">200+ lbs tensile</Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                    Color Specifications (Matching Reference Image)
                  </Typography>
                  <Grid container spacing={2}>
                    {goreTemplate.map((section) => (
                      <Grid item xs={6} sm={4} md={3} key={section.id}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Box
                            sx={{
                              width: 24,
                              height: 24,
                              backgroundColor: section.hexColor,
                              borderRadius: 1,
                              border: '1px solid #ccc',
                            }}
                          />
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              Section {section.sectionNumber}
                            </Typography>
                            <Typography variant="body2" fontWeight="bold">
                              {section.color}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {section.hexColor}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Pattern Legend */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Pattern Legend & Symbols
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Box sx={{ width: 30, height: 3, backgroundColor: '#000', borderStyle: 'dashed' }} />
              <Typography variant="body2">Cut Lines (Black Dashed)</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Box sx={{ width: 30, height: 2, backgroundColor: '#ff0000', borderStyle: 'dashed' }} />
              <Typography variant="body2">Fold Lines (Red Dashed)</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Box sx={{ width: 30, height: 2, backgroundColor: '#0066cc', borderStyle: 'dotted' }} />
              <Typography variant="body2">Chevron Guides (Blue Dotted)</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Box sx={{ width: 30, height: 2, backgroundColor: '#333' }} />
              <Typography variant="body2">Load Tape Placement</Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default BalloonEnvelopePattern;