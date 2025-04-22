document.addEventListener('DOMContentLoaded', () => {
    // Add a welcome message explaining the SHILL ALL button in the image
    const welcome = document.createElement('div');
    welcome.innerHTML = `
        <div class="welcome-overlay" onclick="this.style.display='none'">
            <div class="welcome-message">
                <h2>Welcome to Shill Vibes!</h2>
                <p>Click the glowing SHILL ALL orb in the center to broadcast your token across all platforms.</p>
                <p>Note: You can ignore the "SHILL ALL" button at the bottom of the display - it's part of the background image.</p>
                <p style="margin-top: 20px;font-size:14px;">Click anywhere to continue</p>
            </div>
        </div>
    `;
    document.body.appendChild(welcome);
    
    // Add styles for the welcome overlay
    const style = document.createElement('style');
    style.textContent = `
        .welcome-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(8, 8, 16, 0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            cursor: pointer;
        }
        .welcome-message {
            background: rgba(0, 255, 221, 0.1);
            border: 1px solid rgba(0, 255, 221, 0.3);
            border-radius: 10px;
            padding: 30px;
            max-width: 80%;
            text-align: center;
            color: #00ffdd;
            box-shadow: 0 0 20px rgba(0, 255, 221, 0.2);
        }
        .welcome-message h2 {
            margin-bottom: 15px;
        }
    `;
    document.head.appendChild(style);
    const orbitMap = document.getElementById('orbit-map');
    const tooltip = document.getElementById('tooltip');
    const copyMessage = document.getElementById('copy-message');
    const tokenCore = document.getElementById('token-core');
    const orbitRings = document.getElementById('orbit-rings');
    
    let platforms = [];
    
    // Default message for platforms without prefill links
    const defaultMessage = "Check out this amazing token! Visit https://token.example.com to learn more! #crypto #token";
    
    // Load platforms data from JSON
    fetch('platforms.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`Network response was not ok, status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            platforms = data.platforms;
            setupAnimatedRings();
            renderPlatformNodes();
        })
        .catch(error => {
            console.error('Error loading platforms:', error);
            const errorMsg = document.createElement('div');
            errorMsg.textContent = `Error loading platforms: ${error.message}`;
            errorMsg.style.color = 'red';
            orbitMap.appendChild(errorMsg);
        });
    
    function setupAnimatedRings() {
        // Create multiple concentric animated rings
        const numRings = 5;
        const containerRadius = Math.min(orbitMap.clientWidth, orbitMap.clientHeight) / 2;
        
        for (let i = 1; i <= numRings; i++) {
            const ringRadius = (containerRadius * i) / numRings;
            const ringElement = document.createElement('div');
            ringElement.className = 'orbit-ring';
            ringElement.style.width = `${ringRadius * 2}px`;
            ringElement.style.height = `${ringRadius * 2}px`;
            
            // Alternate rotation direction and speed for visual interest
            const duration = 120 - (i * 15); // Outermost ring is faster
            const direction = i % 2 === 0 ? 'reverse-spin' : 'spin';
            
            ringElement.style.animationName = direction;
            ringElement.style.animationDuration = `${duration}s`;
            
            orbitRings.appendChild(ringElement);
        }
        
        // Create the rotating text elements in a circular path
        createCircularText("SEND OUT YOUR SHILL VIBES", "text-ring-container-1", containerRadius - 30);
        createCircularText("SHILL WAVE CROSSING", "text-ring-container-2", containerRadius - 60, true);
    }
    
    function createCircularText(text, containerId, radius, reverse = false) {
        const container = document.getElementById(containerId);
        const centerX = container.clientWidth / 2;
        const centerY = container.clientHeight / 2;
        
        // Split the text into individual characters and position them in a circle
        const chars = text.split('');
        const angleStep = (2 * Math.PI) / chars.length;
        
        chars.forEach((char, index) => {
            // Calculate position on the circle
            const angle = reverse ? -index * angleStep : index * angleStep;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            
            // Create character element
            const charEl = document.createElement('div');
            charEl.className = 'text-letter';
            charEl.textContent = char;
            charEl.style.left = `${x}px`;
            charEl.style.top = `${y}px`;
            
            // Rotate each character to face outward
            const rotation = (angle * (180 / Math.PI)) + (reverse ? 90 : -90);
            charEl.style.transform = `rotate(${rotation}deg)`;
            
            // Add pulsing glow effect
            charEl.style.animation = `glow 2s infinite alternate ${index * 0.1}s`;
            
            container.appendChild(charEl);
        });
    }
    
    function renderPlatformNodes() {
        // Organize platforms by friction level
        const highFrictionPlatforms = platforms.filter(p => p.friction_level === 'high');
        const mediumFrictionPlatforms = platforms.filter(p => p.friction_level === 'medium');
        const lowFrictionPlatforms = platforms.filter(p => p.friction_level === 'low');
        
        // Sort them from high to low friction (inner to outer rings)
        const sortedPlatforms = [...highFrictionPlatforms, ...mediumFrictionPlatforms, ...lowFrictionPlatforms];
        
        const containerRadius = Math.min(orbitMap.clientWidth, orbitMap.clientHeight) / 2;
        const platformsPerRing = 8;
        const numRings = Math.ceil(sortedPlatforms.length / platformsPerRing);
        
        // Create platform nodes with orbital animation
        sortedPlatforms.forEach((platform, index) => {
            // Calculate which ring this platform should be on
            const ringIndex = Math.floor(index / platformsPerRing);
            const positionInRing = index % platformsPerRing;
            
            // Calculate orbital radius - high friction platforms are closer to center
            const orbitRadius = containerRadius * (0.28 + (ringIndex * 0.15));
            
            // Create node with correct positioning and animation
            const node = createPlatformNode(platform, orbitRadius, positionInRing, platformsPerRing);
            orbitMap.appendChild(node);
        });
    }
    
    function createPlatformNode(platform, radius, position, totalInRing) {
        // Calculate initial angle on the circle
        const angle = (2 * Math.PI * position) / totalInRing;
        
        // Create platform node container
        const node = document.createElement('div');
        node.className = 'platform-node';
        
        // Use the logo path specified in platforms.json, but override with social_logos directory
        const platformName = platform.name.toLowerCase();
        // Create an image element for better error handling
        const img = document.createElement('img');
        img.alt = platform.name;
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.borderRadius = '50%';
        img.style.objectFit = 'cover';
        
        // Try different paths for the logo with proper fallbacks
        // First try the logos directory
        img.src = `logos/${platformName}_logo.png`;
        
        // Handle final fallback to text if all image paths fail
        let fallbackAttempts = 0;
        img.onerror = () => {
            fallbackAttempts++;
            if (fallbackAttempts === 1) {
                // Try the local copy of social_logos first
                console.log('Trying local social_logos path for logo:', platformName);
                img.src = `social_logos/round_fixed/${platformName}_logo.png`;
            } else {
                // Final fallback - use text instead
                console.warn(`Could not load logo for ${platform.name}, using text fallback`);
                img.style.display = 'none';
                node.style.backgroundColor = '#333';
                node.textContent = platform.name.substring(0, 2).toUpperCase();
                node.style.display = 'flex';
                node.style.alignItems = 'center';
                node.style.justifyContent = 'center';
                node.style.fontWeight = 'bold';
                node.style.color = '#fff';
            }
        };
        
        node.appendChild(img);
        
        // Set the orbit animation properties
        node.style.setProperty('--orbit-radius', `${radius}px`);
        
        // Position at center for orbit animation
        node.style.left = '50%';
        node.style.top = '50%';
        
        // Determine orbit speed based on distance (further = faster)
        const containerRadius = Math.min(orbitMap.clientWidth, orbitMap.clientHeight) / 2;
        const orbitDuration = 70 - (radius / containerRadius * 25);
        
        // Give each platform a random starting position in its orbit
        const startDelay = -Math.random() * orbitDuration;
        
        // Use orbital animation with random starting position
        node.style.animation = `orbit ${orbitDuration}s linear infinite ${startDelay}s`;
        
        // Add colored halo based on prefill capability
        if (platform.prefill_link) {
            node.classList.add('halo-green'); // Green for prefill
        } else if (platform.friction_level === 'medium') {
            node.classList.add('halo-yellow'); // Yellow for partial
        } else {
            node.classList.add('halo-red'); // Red for manual
        }
        
        // Add tooltip behavior
        node.addEventListener('mouseover', (e) => {
            const action = platform.prefill_link ? 'Auto-Shill' : (platform.friction_level === 'medium' ? 'Partial' : 'Manual');
            tooltip.textContent = `${platform.name} - ${action}`;
            tooltip.style.opacity = '1';
            tooltip.style.left = `${e.pageX + 10}px`;
            tooltip.style.top = `${e.pageY + 10}px`;
        });
        
        node.addEventListener('mousemove', (e) => {
            tooltip.style.left = `${e.pageX + 10}px`;
            tooltip.style.top = `${e.pageY + 10}px`;
        });
        
        node.addEventListener('mouseout', () => {
            tooltip.style.opacity = '0';
        });
        
        // Add click behavior
        node.addEventListener('click', () => {
            if (platform.prefill_link) {
                window.open(platform.prefill_link, '_blank');
            } else {
                copyToClipboard(defaultMessage);
                showCopyMessage();
            }
        });
        
        return node;
    }
    
    // SHILL ALL functionality - clicking the center orb
    tokenCore.addEventListener('click', () => {
        // Create ripple effect from center
        const ripple = document.createElement('div');
        ripple.className = 'ripple-effect';
        orbitMap.appendChild(ripple);
        
        // Remove ripple after animation completes
        setTimeout(() => {
            orbitMap.removeChild(ripple);
        }, 1000);
        
        // Hide the possible button at the bottom
        const bottomCover = document.getElementById('bottom-cover');
        if (bottomCover) {
            bottomCover.style.height = '180px';
        }
        
        // Open all platforms with prefill links
        const prefillPlatforms = platforms.filter(p => p.prefill_link);
        prefillPlatforms.forEach(platform => {
            window.open(platform.prefill_link, '_blank');
        });
        
        // Copy message for non-prefill platforms
        if (platforms.length > prefillPlatforms.length) {
            copyToClipboard(defaultMessage);
            showCopyMessage();
        }
    });
    
    function copyToClipboard(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
    }
    
    function showCopyMessage() {
        copyMessage.style.opacity = '1';
        setTimeout(() => {
            copyMessage.style.opacity = '0';
        }, 2000);
    }
});