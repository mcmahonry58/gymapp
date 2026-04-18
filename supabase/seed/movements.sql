-- Movement library seed (~60 exercises)
-- Run AFTER 002_movements.sql

insert into public.movements (name, description, muscle_groups, equipment) values

-- CHEST
('Barbell Bench Press', 'Classic horizontal press with a barbell.', array['chest','triceps','shoulders'], array['barbell','bench']),
('Incline Barbell Bench Press', 'Barbell press on an inclined bench targeting upper chest.', array['chest','triceps','shoulders'], array['barbell','bench']),
('Dumbbell Bench Press', 'Horizontal press with dumbbells allowing a greater range of motion.', array['chest','triceps','shoulders'], array['dumbbell','bench']),
('Dumbbell Fly', 'Isolation movement for the chest with a wide arc motion.', array['chest'], array['dumbbell','bench']),
('Cable Fly', 'Chest isolation using cable machine for constant tension.', array['chest'], array['cable']),
('Push Up', 'Bodyweight pressing movement for chest, shoulders, and triceps.', array['chest','triceps','shoulders'], array['bodyweight']),
('Chest Dip', 'Bodyweight dip with forward lean to target the chest.', array['chest','triceps'], array['bodyweight']),

-- BACK
('Barbell Deadlift', 'Fundamental compound lift pulling a loaded barbell from the floor.', array['back','hamstrings','glutes','core'], array['barbell']),
('Barbell Bent Over Row', 'Horizontal pulling movement with a barbell targeting the mid-back.', array['back','biceps'], array['barbell']),
('Dumbbell Single Arm Row', 'Unilateral row with a dumbbell for back thickness.', array['back','biceps'], array['dumbbell','bench']),
('Pull Up', 'Bodyweight vertical pull using an overhead bar.', array['back','biceps'], array['bodyweight']),
('Chin Up', 'Underhand-grip vertical pull emphasising the biceps and lat.', array['back','biceps'], array['bodyweight']),
('Lat Pulldown', 'Machine-assisted vertical pulling movement for lat width.', array['back','biceps'], array['cable','machine']),
('Seated Cable Row', 'Horizontal cable pull targeting mid-back and lats.', array['back','biceps'], array['cable','machine']),
('Face Pull', 'Cable pull to the face targeting rear delts and rotator cuff.', array['shoulders','back'], array['cable']),
('Romanian Deadlift', 'Hip-hinge movement targeting hamstrings and glutes with a barbell.', array['hamstrings','glutes','back'], array['barbell']),

-- SHOULDERS
('Barbell Overhead Press', 'Vertical press with a barbell for overall shoulder development.', array['shoulders','triceps'], array['barbell']),
('Dumbbell Shoulder Press', 'Seated or standing vertical press with dumbbells.', array['shoulders','triceps'], array['dumbbell']),
('Dumbbell Lateral Raise', 'Isolation movement raising dumbbells to the side to target medial delts.', array['shoulders'], array['dumbbell']),
('Dumbbell Front Raise', 'Isolation movement raising dumbbells to the front targeting anterior delts.', array['shoulders'], array['dumbbell']),
('Rear Delt Fly', 'Bent-over isolation movement for the rear deltoid.', array['shoulders','back'], array['dumbbell']),
('Arnold Press', 'Rotating dumbbell press invented by Arnold Schwarzenegger.', array['shoulders','triceps'], array['dumbbell']),
('Upright Row', 'Vertical pull to the chin targeting traps and medial delts.', array['shoulders','back'], array['barbell','dumbbell']),

-- LEGS
('Barbell Back Squat', 'Foundational lower body compound movement with a barbell on the back.', array['quads','glutes','hamstrings','core'], array['barbell']),
('Barbell Front Squat', 'Squat variation with the barbell held in front, emphasising quads.', array['quads','glutes','core'], array['barbell']),
('Goblet Squat', 'Squat holding a dumbbell or kettlebell at the chest.', array['quads','glutes'], array['dumbbell','kettlebell']),
('Leg Press', 'Machine-based push targeting quads, glutes, and hamstrings.', array['quads','glutes','hamstrings'], array['machine']),
('Bulgarian Split Squat', 'Rear-foot elevated single-leg squat for leg development.', array['quads','glutes','hamstrings'], array['dumbbell','bodyweight']),
('Walking Lunge', 'Alternating forward lunge for lower body strength and balance.', array['quads','glutes','hamstrings'], array['dumbbell','bodyweight']),
('Leg Curl', 'Machine isolation movement for the hamstrings.', array['hamstrings'], array['machine']),
('Leg Extension', 'Machine isolation movement for the quadriceps.', array['quads'], array['machine']),
('Hip Thrust', 'Barbell or bodyweight glute bridge from a bench.', array['glutes','hamstrings'], array['barbell','bodyweight','bench']),
('Calf Raise', 'Isolation movement for the calves standing or seated.', array['calves'], array['machine','bodyweight']),
('Step Up', 'Stepping onto a box or bench for single-leg lower body strength.', array['quads','glutes'], array['dumbbell','bodyweight']),

-- BICEPS
('Barbell Curl', 'Classic standing curl with a barbell for bicep mass.', array['biceps'], array['barbell']),
('Dumbbell Curl', 'Alternating or simultaneous dumbbell curl.', array['biceps'], array['dumbbell']),
('Hammer Curl', 'Neutral-grip curl targeting the brachialis and brachioradialis.', array['biceps'], array['dumbbell']),
('Preacher Curl', 'Supported curl on a preacher bench for peak contraction.', array['biceps'], array['barbell','dumbbell','machine']),
('Cable Curl', 'Curl using a low cable pulley for constant tension.', array['biceps'], array['cable']),
('Incline Dumbbell Curl', 'Dumbbell curl on an incline bench for a full stretch.', array['biceps'], array['dumbbell','bench']),

-- TRICEPS
('Tricep Pushdown', 'Cable pushdown isolating the triceps.', array['triceps'], array['cable']),
('Skull Crusher', 'Lying barbell or dumbbell extension for tricep mass.', array['triceps'], array['barbell','dumbbell','bench']),
('Close Grip Bench Press', 'Narrow-grip bench press emphasising the triceps.', array['triceps','chest'], array['barbell','bench']),
('Overhead Tricep Extension', 'Dumbbell or cable extension overhead for the long head.', array['triceps'], array['dumbbell','cable']),
('Tricep Dip', 'Bodyweight dip with upright torso targeting triceps.', array['triceps','chest'], array['bodyweight']),
('Diamond Push Up', 'Close-hand push up for tricep emphasis.', array['triceps','chest'], array['bodyweight']),

-- CORE
('Plank', 'Static hold in a push-up position for core stability.', array['core'], array['bodyweight']),
('Crunch', 'Basic core flexion movement targeting the rectus abdominis.', array['core'], array['bodyweight']),
('Leg Raise', 'Lying or hanging raise of the legs for lower ab emphasis.', array['core'], array['bodyweight']),
('Russian Twist', 'Rotational core movement with a plate or bodyweight.', array['core'], array['bodyweight','dumbbell']),
('Cable Crunch', 'Kneeling cable crunch for weighted ab training.', array['core'], array['cable']),
('Dead Bug', 'Slow, controlled core stability exercise on the back.', array['core'], array['bodyweight']),
('Ab Wheel Rollout', 'Rolling extension with an ab wheel for full core engagement.', array['core'], array['other']),
('Hanging Knee Raise', 'Hanging from a bar, raising the knees to the chest.', array['core'], array['bodyweight']),

-- CONDITIONING
('Rowing Machine', 'Full body cardio on an ergometer.', array['cardio','back','legs'], array['machine']),
('Stationary Bike', 'Low-impact cardio on a stationary bicycle.', array['cardio','quads'], array['machine']),
('Kettlebell Swing', 'Hip-hinge power movement with a kettlebell.', array['glutes','hamstrings','core','cardio'], array['kettlebell']),
('Box Jump', 'Explosive jump onto a box for lower body power.', array['quads','glutes','cardio'], array['bodyweight']),
('Burpee', 'Full body conditioning movement combining a squat, push up, and jump.', array['cardio','chest','quads'], array['bodyweight']),
('Jump Rope', 'Skipping for cardiovascular conditioning and coordination.', array['cardio','calves'], array['other']),
('Treadmill Run', 'Running on a treadmill for cardiovascular endurance.', array['cardio','quads','hamstrings'], array['machine']);
