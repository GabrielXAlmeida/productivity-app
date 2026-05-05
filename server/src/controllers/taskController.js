import { getSupabase } from "../db/supabase.js";

// get /task?week=YYYY-Www
export async function getTasks(req, res) {
    const supabase = getSupabase()
    const { week } = req.query

    let query = supabase
    .from("tasks")
    .select("*")
    .eq("user_id", req.userId)
    .order("scheduled_date", { ascending: true })

    if (week) {
        // converts "YYYY-Www" to days week range
        const { startDate, endDate } = getWeekRange(week)
        query = query.gte("scheduled_date", startDate).lte("scheduled_date", endDate)
    }

    const { data, error } = await query
    if (error) return res.status(500).json({ error: error.message})

    res.json(data)
}

// post /task
export async function createTask(req,res) {
    const supabase = getSupabase()
    const { title, description, priority, scheduled_date, tags } = req.body

    if(!title) return res.status(400).json({ error: "Missing mandatory title"})

    const { data, error } = await supabase
    .from("tasks")
    .insert({
        user_id: req.userId,
        title,
        description,
        priority: priority || "medium",
        status: "pending",
        scheduled_date,
        tags,
    })
    .select()
    .single()

    if(error) return res.status(500).json({ error: error.message })

    res.status(201).json(data)
}

//put /tasks/:id
export async function updateTask(req,res) {
    const supabase = getSupabase()
    const { id } = req.params
    const { title, description, priority, status, scheduled_date, tags } = req.body

    const { data, error} = await supabase
    .from("tasks")
    .update({ title, description, priority, status, scheduled_date, tags })
    .eq("id", id)
    .eq("user_id", req.userId) //only the owner can update
    .select()
    .single()

    if(error) return res.status(500).json({ error: error.message})
    if(!data) return res.status(404).json({ error: "Task not found" })

    res.json(data)
}

// delete /task/:id
export async function deleteTask(req,res){
    const supabase = getSupabase()
    const { id } = req.params

    const { error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", id)
    .eq("user_id", req.userId)

    if(error) return res.status(500).json({ error: error.message})

    res.status(204).send()
}

// patch /tasks/:id/complete
export async function completeTask(req,res){
    const supabse = getSupabase()
    const { id } = req.params

    const {data, error} = await supabse
    .from("tasks")
    .update({status: "completed"})
    .eq("id", id)
    .eq("user_id", req.userId)
    .select()
    .single()

    if(error) return res.status(500).json({error: error.message})
    if(!data) return res.status(404).json({error: "Task not found"})

    res.json(data)
}

// PATCH /tasks/:id/reopen
export async function reopenTask(req, res) {
  const supabase = getSupabase();
  const { id } = req.params;

  const { data, error } = await supabase
    .from("tasks")
    .update({ status: "pending" })
    .eq("id", id)
    .eq("user_id", req.userId)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: "Tarefa não encontrada" });

  res.json(data);
}

//helper - converts "YYYY-Www" to {startDte, endDate}
function getWeekRange(week){
    const [yearStr, weekStr] = week.split("-W")
    const year = parseInt(yearStr)
    const weekNum = parseInt(weekStr)

    // first day of the year
    const jan4 = new Date(year, 0, 4) //jan 4 is always in the first week 
    const startOfWeek1 = new Date(jan4)
    startOfWeek1.setDate(jan4.getDate() - ((jan4.getDay() + 6) % 7))

    const startDate = new Date(startOfWeek1)
    startDate.setDate(startOfWeek1.getDate() + (weekNum - 1) * 7)

    const endDate = new Date(startDate)
    endDate.setDate(startDate.getDate() + 6)

    return {
        startDate: startDate.toISOString().split("T")[0],
        endDate: endDate.toISOString().split("T")[0]
    }
}