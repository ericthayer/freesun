import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardMedia,
  IconButton,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Chip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ImageList,
  ImageListItem,
} from '@mui/material';
import MaterialIcon from '../common/MaterialIcon';

interface MediaFile {
  id: string;
  name: string;
  type: 'image' | 'video';
  url: string;
  thumbnail: string;
  uploadDate: Date;
  uploadedBy: string;
  description: string;
  tags: string[];
  likes: number;
  downloads: number;
}

interface CartItem {
  product: MediaFile;
  quantity: number;
}

const MediaGallery: React.FC = () => {
  const [selectedMedia, setSelectedMedia] = useState<MediaFile | null>(null);
  const [uploadDialog, setUploadDialog] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'image' | 'video'>('all');
  const [favorites, setFavorites] = useState<string[]>([]);

  const mediaFiles: MediaFile[] = [
    {
      id: '1',
      name: 'Sunrise Flight Over Rockies',
      type: 'image',
      url: 'https://assets.codepen.io/97621/img-ballooning-3008_1.jpg?format=avif',
      thumbnail: 'https://assets.codepen.io/97621/img-ballooning-3008_1.jpg?format=avif',
      uploadDate: new Date('2024-12-10'),
      uploadedBy: 'John Pilot',
      description: 'Spectacular sunrise flight capturing the golden hour over Colorado\'s majestic Rocky Mountains with multiple colorful hot air balloons',
      tags: ['sunrise', 'mountains', 'scenic', 'golden hour'],
      likes: 24,
      downloads: 12
    },
    {
      id: '2',
      name: 'Colorado Balloon Festival',
      type: 'video',
      url: 'https://assets.codepen.io/97621/festival-480p-01.mov',
      thumbnail: 'https://assets.codepen.io/97621/img-ballooning-1763.jpg?width=2419&height=1814&format=webp',
      uploadDate: new Date('2024-12-08'),
      uploadedBy: 'Sarah Chen',
      description: 'Annual Colorado Hot Air Balloon Festival showcasing dozens of vibrant balloons against the dramatic mountain backdrop',
      tags: ['festival', 'competition', 'group flight', 'colorado'],
      likes: 18,
      downloads: 8
    },
    {
      id: '3',
      name: 'Alpine Valley Aerial View',
      type: 'image',
      url: 'https://assets.codepen.io/97621/img-ballooning-0981.JPG?format=webp',
      thumbnail: 'https://assets.codepen.io/97621/img-ballooning-0981.JPG?format=webp',
      uploadDate: new Date('2024-12-05'),
      uploadedBy: 'Mike Rodriguez',
      description: 'Breathtaking aerial perspective of Colorado\'s alpine valleys and pristine lakes from 2,000 feet above ground',
      tags: ['aerial', 'valley', 'lakes', 'landscape'],
      likes: 15,
      downloads: 22
    },
    {
      id: '4',
      name: 'Balloon Envelope Close-up',
      type: 'image',
      url: 'https://assets.codepen.io/97621/img-ballooning-3199_1.jpg?format=webphttps://assets.codepen.io/97621/img-ballooning-2406_1.jpg?width=2217&height=1663&format=webp',
      thumbnail: 'https://assets.codepen.io/97621/img-ballooning-3199_1.jpg?format=webp',
      uploadDate: new Date('2024-12-03'),
      uploadedBy: 'Emma Thompson',
      description: 'Detailed close-up of our signature red and blue balloon envelope showing the intricate panel construction and vibrant colors',
      tags: ['balloon', 'envelope', 'colors', 'detail'],
      likes: 31,
      downloads: 19
    },
    {
      id: '5',
      name: 'Mountain Range Panorama',
      type: 'image',
      url: 'https://www.colorado.com/_next/image?url=https%3A%2F%2Fapi.colorado.com%2F%2Fsites%2Fdefault%2Ffiles%2Flegacy_drupal_7_images%2FTwin%2520Lakes_MUST%2520CREDIT_%2520mark%2520byzewski_0.jpg&w=3840&q=75',
      thumbnail: 'https://www.colorado.com/_next/image?url=https%3A%2F%2Fapi.colorado.com%2F%2Fsites%2Fdefault%2Ffiles%2Flegacy_drupal_7_images%2FTwin%2520Lakes_MUST%2520CREDIT_%2520mark%2520byzewski_0.jpg&w=3840&q=75',
      uploadDate: new Date('2024-12-01'),
      uploadedBy: 'John Pilot',
      description: 'Stunning panoramic view of the Front Range mountains with snow-capped peaks extending to the horizon',
      tags: ['panorama', 'mountains', 'snow peaks', 'front range'],
      likes: 42,
      downloads: 28
    },
    {
      id: '6',
      name: 'Dawn Launch Preparation',
      type: 'video',
      url: 'https://assets.codepen.io/97621/inflate-01.mov',
      thumbnail: 'https://assets.codepen.io/97621/img-ballooning-3200_1.jpg?format=webp',
      uploadDate: new Date('2024-11-28'),
      uploadedBy: 'Emma Thompson',
      description: 'Time-lapse footage of our crew preparing for dawn launch, from envelope inflation to final safety checks',
      tags: ['preparation', 'dawn', 'crew', 'time-lapse'],
      likes: 12,
      downloads: 35
    },
    {
      id: '7',
      name: 'Aspen Grove Flyover',
      type: 'image',
      url: 'https://assets.codepen.io/97621/img-ballooning-2406_1.jpg?width=2217&height=1663&format=webp',
      thumbnail: 'https://assets.codepen.io/97621/img-ballooning-2406_1.jpg?width=2217&height=1663&format=webp',
      uploadDate: new Date('2024-11-25'),
      uploadedBy: 'Sarah Chen',
      description: 'Autumn flight over golden aspen groves in the Colorado high country, showcasing fall foliage from above',
      tags: ['autumn', 'aspen', 'fall colors', 'forest'],
      likes: 38,
      downloads: 24
    },
    {
      id: '8',
      name: 'Multi-Balloon Formation',
      type: 'image',
      url: 'https://assets.codepen.io/97621/img-ballooning-1843.jpg?width=2217&height=1663&format=webp',
      thumbnail: 'https://assets.codepen.io/97621/img-ballooning-1843.jpg?width=2217&height=1663&format=webp',
      uploadDate: new Date('2024-11-20'),
      uploadedBy: 'Mike Rodriguez',
      description: 'Formation flight featuring five colorful hot air balloons floating gracefully above the Colorado plains',
      tags: ['formation', 'multiple balloons', 'plains', 'teamwork'],
      likes: 29,
      downloads: 16
    },
     {
      id: '9',
      name: 'Pre-flight checklist',
      type: 'image',
      url: 'https://assets.codepen.io/97621/img-ballooning-2860_1.jpg?width=1965&height=2620&format=webp',
      thumbnail: 'https://assets.codepen.io/97621/img-ballooning-2860_1.jpg?width=1965&height=2620&format=webp',
      uploadDate: new Date('2025-7-20'),
      uploadedBy: 'Lee Harvey',
      description: 'First things to be aware of when you are a new pilot.',
      tags: ['formation', 'teamwork'],
      likes: 7,
      downloads: 10
    }
  ];

  const filteredMedia = filterType === 'all' 
    ? mediaFiles 
    : mediaFiles.filter(file => file.type === filterType);

  const toggleFavorite = (fileId: string) => {
    setFavorites(prev =>
      prev.includes(fileId)
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  };

  const handleDownload = (file: MediaFile) => {
    // In a real app, this would trigger a download
    console.log('Downloading:', file.name);
  };

  const handleShare = (file: MediaFile) => {
    // In a real app, this would open a share dialog
    console.log('Sharing:', file.name);
  };

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" gutterBottom>
              Media Gallery
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Professional photography and videos from our Colorado balloon adventures
            </Typography>
          </Box>
          <Fab
            color="primary"
            onClick={() => setUploadDialog(true)}
            sx={{ ml: 2 }}
          >
            <MaterialIcon icon="add" />
          </Fab>
        </Box>
      </Paper>

      {/* Filter Controls */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Media Type</InputLabel>
          <Select
            value={filterType}
            label="Media Type"
            onChange={(e) => setFilterType(e.target.value as any)}
          >
            <MenuItem value="all">All Media</MenuItem>
            <MenuItem value="image">Images</MenuItem>
            <MenuItem value="video">Videos</MenuItem>
          </Select>
        </FormControl>
        
        <Typography variant="body2" color="text.secondary">
          {filteredMedia.length} files
        </Typography>
      </Box>

      {/* Media Grid */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {filteredMedia.map((file) => (
          <Grid item xs={12} sm={6} md={4} key={file.id}>
            <Card
              sx={{
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
                },
              }}
              onClick={() => setSelectedMedia(file)}
            >
              <Box sx={{ position: 'relative', overflow: 'hidden' }}>
                <CardMedia
                  component="img"
                  height="240"
                  image={file.thumbnail}
                  alt={file.description}
                  sx={{
                    transition: 'transform 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.05)',
                    },
                  }}
                />
                {file.type === 'video' && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      borderRadius: '50%',
                      p: 2,
                      backdropFilter: 'blur(10px)',
                    }}
                  >
                    <MaterialIcon icon="play_arrow" sx={{ color: 'white', fontSize: 36 }} />
                  </Box>
                )}
                
                {/* Action Buttons */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    display: 'flex',
                    gap: 1,
                  }}
                >
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(file.id);
                    }}
                    sx={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(10px)',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 1)',
                        transform: 'scale(1.1)',
                      },
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {favorites.includes(file.id) ? (
                      <MaterialIcon icon="favorite" color="error" fontSize="small" />
                    ) : (
                      <MaterialIcon icon="favorite_border" fontSize="small" />
                    )}
                  </IconButton>
                </Box>

                {/* Media Type Badge */}
                <Chip
                  icon={<MaterialIcon icon={file.type === 'image' ? 'photo_library' : 'video_library'} />}
                  label={file.type.toUpperCase()}
                  size="small"
                  color={file.type === 'image' ? 'primary' : 'secondary'}
                  sx={{
                    position: 'absolute',
                    bottom: 12,
                    left: 12,
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)',
                    fontWeight: 600,
                  }}
                />

                {/* Gradient Overlay */}
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '50%',
                    background: 'linear-gradient(transparent, rgba(0, 0, 0, 0.7))',
                    pointerEvents: 'none',
                  }}
                />

                {/* Title Overlay */}
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 12,
                    right: 12,
                    left: 60,
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{
                      color: 'white',
                      fontWeight: 700,
                      textShadow: '0 2px 8px rgba(0, 0, 0, 0.8)',
                      fontSize: '0.9rem',
                    }}
                  >
                    {file.name}
                  </Typography>
                </Box>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Media Detail Dialog */}
      <Dialog
        open={!!selectedMedia}
        onClose={() => setSelectedMedia(null)}
        maxWidth="lg"
        fullWidth
      >
        {selectedMedia && (
          <>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">{selectedMedia.name}</Typography>
              <IconButton onClick={() => setSelectedMedia(null)}>
                <MaterialIcon icon="close" />
              </IconButton>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                  {selectedMedia.type === 'image' ? (
                    <img
                      src={selectedMedia.url}
                      alt={selectedMedia.description}
                      style={{ width: '100%', height: 'auto', borderRadius: 12 }}
                    />
                  ) : (
                    <video
                      controls
                      style={{ width: '100%', height: 'auto', borderRadius: 12 }}
                    >
                      <source src={selectedMedia.url} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  )}
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="h6" gutterBottom>
                    Details
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {selectedMedia.description}
                  </Typography>
                  
                  <Typography variant="subtitle2" gutterBottom>
                    Uploaded by: {selectedMedia.uploadedBy}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {selectedMedia.uploadDate.toLocaleDateString()}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 2 }}>
                    {selectedMedia.tags.map((tag) => (
                      <Chip
                        key={tag}
                        label={tag}
                        size="small"
                        variant="outlined"
                        color="primary"
                      />
                    ))}
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary">
                    {selectedMedia.likes} likes • {selectedMedia.downloads} downloads
                  </Typography>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button
                startIcon={<MaterialIcon icon="download" />}
                onClick={() => handleDownload(selectedMedia)}
              >
                Download
              </Button>
              <Button
                startIcon={<MaterialIcon icon="share" />}
                onClick={() => handleShare(selectedMedia)}
              >
                Share
              </Button>
              <Button
                startIcon={<MaterialIcon icon={favorites.includes(selectedMedia.id) ? 'favorite' : 'favorite_border'} />}
                onClick={() => toggleFavorite(selectedMedia.id)}
                color={favorites.includes(selectedMedia.id) ? 'error' : 'primary'}
              >
                {favorites.includes(selectedMedia.id) ? 'Unfavorite' : 'Favorite'}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Upload Dialog */}
      <Dialog
        open={uploadDialog}
        onClose={() => setUploadDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Upload Media</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Button
              variant="outlined"
              startIcon={<MaterialIcon icon="cloud_upload" />}
              component="label"
              sx={{ py: 3 }}
            >
              Choose Files to Upload
              <input
                type="file"
                hidden
                multiple
                accept="image/*,video/*"
              />
            </Button>
            <TextField
              label="Description"
              multiline
              rows={3}
              fullWidth
              placeholder="Describe your media files..."
            />
            <TextField
              label="Tags"
              fullWidth
              placeholder="Add tags separated by commas..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setUploadDialog(false)}>
            Upload
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MediaGallery;