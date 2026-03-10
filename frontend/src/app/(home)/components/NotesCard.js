import { motion } from "framer-motion";
// const notesData = [
//     { id: 358, title: "Amber", type: "BASE_NOTE", description: "" },
//     { id: 399, title: "Sandalwood", type: "MIDDLE_NOTE", description: "" },
//     { id: 550, title: "Earthy Musk", type: "TOP_NOTE", description: "" },
// ];

const NotesCard = ({ notes }) => {
    const groupedNotes = notes.reduce((acc, note) => {
        if (!acc[note.type]) {
            acc[note.type] = [];
        }
        acc[note.type].push(note);
        return acc;
    }, {});

    const sectionTitle = {
        TOP_NOTE: "Top Notes",
        HEART_NOTE: "Heart Notes",
        BASE_NOTE: "Base Notes",
    };

    return (
        <div className="space-y-10">
            {Object.entries(groupedNotes).map(([type, notesGroup], index) => (
                <div key={type}>
                    <motion.h4
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.2 }}
                        className="text-2xl font-medium text-gray-800 border-b pb-2 uppercase tracking-wide"
                    >
                        {sectionTitle[type] || type}
                    </motion.h4>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
                        {notesGroup.map((note, i) => (

                            <motion.div
                                key={note.id}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.2 + i * 0.1 }}
                                className="border border-gray-300 p-1 flex justify-center items-center text-center uppercase text-sm tracking-wide text-gray-700"
                            >
                                <div>
                                     {note.title}
                                </div>
                                <div>
                                    {note.description}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default NotesCard;
