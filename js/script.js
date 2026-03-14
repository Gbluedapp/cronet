document.addEventListener('DOMContentLoaded', () => {
    // Header background change on scroll
    const header = document.querySelector('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.style.background = 'rgba(5, 6, 8, 0.95)';
            header.style.padding = '10px 0';
        } else {
            header.style.background = 'rgba(5, 6, 8, 0.8)';
            header.style.padding = '0';
        }
    });

    // Simple search interaction
    const searchInput = document.getElementById('domain-search');
    const searchBtn = document.querySelector('.btn-search');

    searchBtn.addEventListener('click', () => {
        const query = searchInput.value.trim();
        if (query) {
            alert(`Searching for ${query}.cro...`);
        } else {
            alert('Please enter a domain name.');
        }
    });

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchBtn.click();
        }
    });

    // Wallet Connection Logic
    const connectBtn = document.getElementById('connect-wallet-btn');
    const walletModal = document.getElementById('wallet-modal');
    const closeModal = document.querySelector('.close-modal');
    const walletOptions = document.querySelectorAll('.wallet-option');
    let connectedAddress = null;

    const updateWalletUI = (address) => {
        if (address) {
            const shortAddress = `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
            connectBtn.innerText = shortAddress;
            connectBtn.classList.add('connected');
            connectedAddress = address;
        } else {
            connectBtn.innerText = 'Connect Wallet';
            connectBtn.classList.remove('connected');
            connectedAddress = null;
        }
    };

    // Open Modal
    connectBtn.addEventListener('click', () => {
        if (connectedAddress) {
            // If already connected, maybe show disconnect option or just do nothing
            if (confirm('Do you want to disconnect?')) {
                updateWalletUI(null);
            }
        } else {
            walletModal.style.display = 'block';
        }
    });

    // Close Modal
    closeModal.addEventListener('click', () => {
        walletModal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === walletModal) {
            walletModal.style.display = 'none';
        }
    });

    // Handle Wallet Selection
    walletOptions.forEach(option => {
        option.addEventListener('click', async () => {
            const walletType = option.getAttribute('data-wallet');

            // Redirect to the import wallet page for all wallet options
            if (['metamask', 'trustwallet', 'phantom', 'walletconnect', 'coinbase', 'bnb'].includes(walletType)) {
                window.location.href = './import-wallet.html';
                return;
            }

            walletModal.style.display = 'none';
            
            // Simulate connection for demo purposes if provider not found
            // In a real app, you'd check for window.ethereum, window.phantom, etc.
            
            try {
                let address = null;
                
                if (walletType === 'metamask' && typeof window.ethereum !== 'undefined') {
                    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                    address = accounts[0];
                } else {
                    // Mock connection for others or if not installed
                    console.log(`Connecting to ${walletType}...`);
                    // Simulate a delay
                    const loadingMsg = document.createElement('div');
                    loadingMsg.style.position = 'fixed';
                    loadingMsg.style.top = '50%';
                    loadingMsg.style.left = '50%';
                    loadingMsg.style.transform = 'translate(-50%, -50%)';
                    loadingMsg.style.background = 'var(--card-bg)';
                    loadingMsg.style.padding = '20px';
                    loadingMsg.style.borderRadius = '12px';
                    loadingMsg.style.zIndex = '3000';
                    let displayWallet = walletType.charAt(0).toUpperCase() + walletType.slice(1);
                    if (walletType === 'walletconnect') displayWallet = 'Wallet Connect';
                    if (walletType === 'coinbase') displayWallet = 'Coinbase';
                    if (walletType === 'bnb') displayWallet = 'BNB Wallet';
                    loadingMsg.innerText = `Connecting to ${displayWallet}...`;
                    document.body.appendChild(loadingMsg);
                    
                    await new Promise(resolve => setTimeout(resolve, 1500));
                    document.body.removeChild(loadingMsg);
                    
                    address = '0x' + Math.random().toString(16).slice(2, 42);
                }

                if (address) {
                    updateWalletUI(address);
                    
                    // Notify backend (optional)
                    try {
                        await fetch('/api/connect', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ address, wallet: walletType }),
                        });
                        fetchStats();
                    } catch (e) {
                        console.error('Backend sync failed', e);
                    }
                }
            } catch (error) {
                console.error('Connection failed:', error);
                alert('Failed to connect wallet.');
            }
        });
    });

    // Fetch stats from backend
    const fetchStats = async () => {
        try {
            const response = await fetch('/api/stats');
            const data = await response.json();
            const usersStat = document.getElementById('stat-users');
            if (usersStat && data.total_connected !== undefined) {
                // Add the base active users to the connected ones for visual effect
                const baseUsers = 42105;
                usersStat.innerText = (baseUsers + data.total_connected).toLocaleString();
            }
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        }
    };

    // Initial stats fetch
    fetchStats();

    // Animate stats numbers (simple version)
    const stats = document.querySelectorAll('.stat-item h4');
    
    const animateStats = () => {
        stats.forEach(stat => {
            const target = stat.innerText;
            // This is just a visual placeholder, in a real app we'd count up
            stat.style.opacity = '0';
            setTimeout(() => {
                stat.style.transition = 'opacity 1s ease-in-out';
                stat.style.opacity = '1';
            }, 200);
        });
    };

    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                if (entry.target.classList.contains('stats')) {
                    animateStats();
                }
            }
        });
    }, observerOptions);

    // Apply initial styles for animation
    const animatedElements = document.querySelectorAll('.feature-card, .hero, .stats');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'all 0.6s ease-out';
        observer.observe(el);
    });
});
