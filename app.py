import streamlit as st

st.set_page_config(page_title="Culture Radar", page_icon="🧭", layout="wide")

# Google Gravity + Anti Gravity CSS
st.markdown("""
<style>
.gravity-card {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 25px; border-radius: 20px; color: white; margin: 15px 0;
    animation: fall 1.5s ease-out, float 3s ease-in-out infinite 1.5s;
    box-shadow: 0 10px 30px rgba(102,126,234,0.4);
}
@keyframes fall {
    from { transform: translateY(-800px) rotate(-10deg); opacity: 0; }
    to { transform: translateY(0) rotate(0deg); opacity: 1; }
}
@keyframes float {
    0% { transform: translateY(0px); }
    50% { transform: translateY(-12px); }
    100% { transform: translateY(0px); }
}
</style>
""", unsafe_allow_html=True)

st.title("🧭 CULTURE RADAR")
st.subheader("Discover Stories, Not Just Places")

col1, col2 = st.columns(2)
with col1:
    st.markdown('<div class="gravity-card">📍 Delhi → Red Fort<br>Story: 1857 Rebellion Echoes</div>', unsafe_allow_html=True)
with col2:
    st.markdown('<div class="gravity-card">📍 Jaipur → Amber Fort<br>Story: Rajput Legends</div>', unsafe_allow_html=True)

st.success("Anti-Gravity Mode: ON ✨")
