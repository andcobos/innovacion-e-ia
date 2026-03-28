-- Drop tables if they exist to keep it clean for rerun
DROP TABLE IF EXISTS expenses;
DROP TABLE IF EXISTS sales;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS businesses;
DROP TABLE IF EXISTS profiles;

-- Profiles
CREATE TABLE profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  full_name text NOT NULL,
  role text DEFAULT 'emprendedor' NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Function and Trigger to automatically create profile on sign up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, role)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', 'emprendedor');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Businesses
CREATE TABLE businesses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  business_name text NOT NULL,
  business_category text NOT NULL,
  instagram_handle text,
  description text,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Products
CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  category text,
  sale_price numeric DEFAULT 0 NOT NULL,
  cost_price numeric DEFAULT 0 NOT NULL,
  stock integer DEFAULT 0 NOT NULL,
  is_active boolean DEFAULT true NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Sales
CREATE TABLE sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  quantity integer DEFAULT 1 NOT NULL,
  unit_sale_price numeric DEFAULT 0 NOT NULL,
  discount_amount numeric DEFAULT 0 NOT NULL,
  total_sale_amount numeric DEFAULT 0 NOT NULL,
  sale_date date DEFAULT current_date NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Expenses
CREATE TABLE expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  description text NOT NULL,
  amount numeric DEFAULT 0 NOT NULL,
  expense_category text,
  ai_suggested_category text,
  expense_type text,
  expense_date date DEFAULT current_date NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Setting up RLS (Row Level Security)

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Users can view own profile" 
  ON profiles FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own profile" 
  ON profiles FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = user_id);

-- Businesses Policies
CREATE POLICY "Users can view own business" 
  ON businesses FOR SELECT 
  USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can create own business" 
  ON businesses FOR INSERT 
  WITH CHECK (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can update own business" 
  ON businesses FOR UPDATE 
  USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Products Policies
CREATE POLICY "Users can manage own products" 
  ON products FOR ALL 
  USING (business_id IN (
    SELECT id FROM businesses WHERE profile_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  ));

-- Sales Policies
CREATE POLICY "Users can manage own sales" 
  ON sales FOR ALL 
  USING (business_id IN (
    SELECT id FROM businesses WHERE profile_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  ));

-- Expenses Policies
CREATE POLICY "Users can manage own expenses" 
  ON expenses FOR ALL 
  USING (business_id IN (
    SELECT id FROM businesses WHERE profile_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  ));
