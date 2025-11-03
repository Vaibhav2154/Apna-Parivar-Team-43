#!/bin/bash

# ApnaParivar Backend Setup Script

echo "======================================="
echo "ApnaParivar Backend Setup"
echo "======================================="
echo ""

# Check Python version
echo "Checking Python version..."
python3 --version

echo ""
echo "Installing dependencies..."
pip install -e .

echo ""
echo "======================================="
echo "Setup Complete!"
echo "======================================="
echo ""
echo "Next steps:"
echo "1. Create .env file with your Supabase credentials"
echo "   - Copy .env.example to .env"
echo "   - Update SUPABASE_URL, SUPABASE_KEY, SUPABASE_JWT_SECRET"
echo ""
echo "2. Execute SQL scripts in Supabase:"
echo "   - Run sql/schema.sql"
echo "   - Run sql/rls_policies.sql"
echo ""
echo "3. Run the backend:"
echo "   python main.py"
echo ""
echo "4. Access API documentation:"
echo "   http://localhost:8000/docs"
echo ""
