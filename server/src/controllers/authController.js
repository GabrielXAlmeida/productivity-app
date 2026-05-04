import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { getSupabase } from '../db/supabase.js'

export const register = async (req, res) => {
  const supabase = getSupabase()
  const { email, password } = req.body

  const { data: existingUser } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .single()

  if (existingUser) {
    return res.status(400).json({ error: 'Email already in use' })
  }

  const password_hash = await bcrypt.hash(password, 10)

  const { data, error } = await supabase
    .from('users')
    .insert([{ email, password_hash }])
    .select()
    .single()

  if (error) {
    return res.status(500).json({ error: 'Error creating user' })
  }

  const token = jwt.sign({ id: data.id }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  })

  res.status(201).json({ token, user: { id: data.id, email: data.email } })
}

export const login = async (req, res) => {
  const supabase = getSupabase()
  const { email, password } = req.body

  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single()

  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' })
  }

  const validPassword = await bcrypt.compare(password, user.password_hash)

  if (!validPassword) {
    return res.status(401).json({ error: 'Invalid credentials' })
  }

  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  })

  res.json({ token, user: { id: user.id, email: user.email } })
}